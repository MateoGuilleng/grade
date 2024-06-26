"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/config/firebase";
import { toast } from "sonner";
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
} from "firebase/database";
import {
  Button,
  TextInput,
  Dropdown,
  Tooltip,
  Sidebar,
  Drawer,
} from "flowbite-react";
import Navbar from "@/components/Navbar";
import CustomChatDrawer from "@/components/sideBarChats";
import { useRouter } from "next/navigation";
import { FaQuestionCircle } from "react-icons/fa";
import { HiArrowCircleDown, HiMenu } from "react-icons/hi";

import moment from "moment";

function ChatPage() {
  const [user, setUser] = useState(""); //email
  const [participant, setParticipants] = useState();

  const [userData, setUserData] = useState();
  const [participantData, setParticipantData] = useState();

  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState("");
  const [chats, setChats] = useState([]);
  const [editingMessage, setEditingMessage] = useState(false);
  const [editMessageContent, setEditMessageContent] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  console.log(participant);

  console.log(chatId);

  const handleClose = () => setIsOpen(false);

  const router = useRouter();
  useEffect(() => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath
      .split("/")
      .filter((part) => part.trim() !== "");
    const userPart = pathParts[pathParts.length - 3];
    const chatIdPart = pathParts[pathParts.length - 1];

    setUser(userPart);
    setChatId(chatIdPart);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/${user}`);
          const userData = await response.json();
          setUserData(userData);
          setChats(userData.chats);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchData();
  }, [user]);

  console.log(participantData);
  useEffect(() => {
    const fetchData = async () => {
      if (participant) {
        try {
          const response = await fetch(`/api/${participant}`);
          const userData = await response.json();
          setParticipantData(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchData();
  }, [participant]);

  useEffect(() => {
    const fetchUserIdsAndChatId = async () => {
      if (user && chatId) {
        console.log(user, chatId);
        try {
          const userRes = await fetchUserData(user);

          if (!userRes) {
            throw new Error("User not found");
          }

          setUserId(userRes._id);

          const chatParticipantsRef = ref(db, `chats/${chatId}/participants`);
          const chatMessagesRef = ref(db, `chats/${chatId}/messages`);

          // Subscribe to participants
          const unsubscribeParticipants = onValue(
            chatParticipantsRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const allParticipants = Object.values(snapshot.val());
                console.log(allParticipants);

                const filteredParticipants = allParticipants.filter(
                  (participant) => participant !== user
                );

                setParticipants(filteredParticipants.join(", "));
              } else {
                setParticipants([]);
              }
            }
          );

          // Subscribe to messages
          const unsubscribeMessages = onValue(chatMessagesRef, (snapshot) => {
            if (snapshot.exists()) {
              setMessages(
                Object.entries(snapshot.val()).map(([id, msg]) => ({
                  id,
                  ...msg,
                }))
              );
            } else {
              setMessages([]);
            }
          });

          // Cleanup subscriptions on unmount
          return () => {
            unsubscribeParticipants();
            unsubscribeMessages();
          };
        } catch (error) {
          console.error("Error fetching user data or chat messages:", error);
        }
      }
    };

    fetchUserIdsAndChatId();
  }, [user, chatId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && userId && chatId) {
      const messagesRef = ref(db, `chats/${chatId}/messages`);
      const newMessageRef = push(messagesRef);
      set(newMessageRef, {
        sender: userId,
        message: newMessage,
        timestamp: Date.now(),
      });
      setNewMessage("");
    }
  };

  const handleEditMessage = (messageId, currentContent) => {
    setEditingMessage(messageId);
    setEditMessageContent(currentContent);
  };

  const handleUpdateMessage = (messageId) => {
    const messageRef = ref(db, `chats/${chatId}/messages/${messageId}`);
    update(messageRef, {
      message: editMessageContent,
      edited: true,
    });
    setEditingMessage(null);
    setEditMessageContent("");
  };

  const handleDeleteMessage = (messageId) => {
    const messageRef = ref(db, `chats/${chatId}/messages/${messageId}`);
    remove(messageRef);
    toast.success("message deleted");
  };

  const handleChatClick = (id) => {
    router.push(`/${user}/chats/${id}`);
  };

  const fetchUserData = async (email) => {
    const response = await fetch(`/api/${email}`);
    if (!response.ok) {
      throw new Error(`Error fetching user data for ${email}`);
    }
    return await response.json();
  };

  function splitMessage(message, length) {
    const regex = new RegExp(`.{1,${length}}`, "g");
    return message.match(regex).join("<br />");
  }

  console.log(participantData);

  return (
    <div>
      <Navbar />

      <div className="flex h-screen">
        <div className="w-3/12 hidden md:block bg-gray-100 text-black dark:text-white dark:bg-neutral-950 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">Chats:</h2>
          {userData?.chats.map((chat, index) => (
            <div
              key={index}
              onClick={() => handleChatClick(chat.chatId)}
              className="cursor-pointer p-2 mb-2 bg-white text-black dark:bg-black dark:hover:bg-gray-900 dark:text-white rounded hover:bg-gray-200"
            >
              <div className="flex items-center">
                <div className="mb-1 text-sm font-semibold flex md:flex-nowrap flex-wrap">
                  <p className="mr-3">Nickname:</p>
                  <p className="md:text-sm text-xs ml-0">
                    {chat.chatWithNickName}
                  </p>
                </div>
                <Tooltip
                  content="The nickname here will not be changed even if the user changes them"
                  style="dark"
                >
                  <Button>
                    <FaQuestionCircle className="dark:text-white text-black" />
                  </Button>
                </Tooltip>
              </div>
              <p className="mb-1 text-sm ">
                <p className="sm:text-sm text-3xs w-fit font-bold">
                  {chat.chatWithEmail}
                </p>
              </p>
              <p className="mb-1 text-2xs dark:text-white/50 text-black/50">
                Chat ID: {chat.chatId}
              </p>
            </div>
          ))}
        </div>

        <div className="flex-1 w-7/12 flex flex-col h-full p-4  rounded-lg  bg-white dark:bg-black text-black dark:text-white">
          <div className="bg-gray-200 dark:bg-black p-4 text-center flex items-center text-black dark:text-white">
            <span className="text-left">
              <CustomChatDrawer chats={chats} />
            </span>
            <img
              src={participantData?.profile_image}
              alt={`${participantData?.firstName} ${participantData?.lastName}`}
              className="w-16 h-16 ml-2 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600"
            />
            <div className="md:text-2xl text-sm font-bold ml-5">
              <div className="flex gap-5 items-center flex-wrap">
                Chatting with:{" "}
                <p className="md:ml-2 text-xl">{participantData?.nickName} </p>{" "}
                <p className="text-black/50 dark:text-white/50 text-xs">{participant}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-black rounded shadow text-black dark:text-white">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${
                  msg.sender === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 text-black dark:text-white w-full rounded-lg ${
                    msg.sender === userId
                      ? "bg-blue-500/10 dark:text-white/75 text-black"
                      : "bg-gray-300/10 dark:text-white/75 text-black"
                  }`}
                >
                  {editingMessage === msg.id ? (
                    <div>
                      <TextInput
                        value={editMessageContent}
                        onChange={(e) => setEditMessageContent(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex ">
                        <Button
                          onClick={() => handleUpdateMessage(msg.id)}
                          className="text-black dark:text-white mr-2"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingMessage(null)}
                          color="light"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start align-top">
                        <p
                          className="mr-10 mt-2"
                          dangerouslySetInnerHTML={{
                            __html: splitMessage(msg.message, 90),
                          }}
                        ></p>
                        <div>
                          {msg.sender === userId && (
                            <div className="flex space-x-2 mt-0 p-0 m-0 align-top  self-start">
                              <div className=" pr-2 bg-black/10 rounded-full">
                                <Dropdown
                                  className="align-top self-start"
                                  dismissOnClick={false}
                                >
                                  <Dropdown.Item
                                    className="bg-black/75"
                                    onClick={() =>
                                      handleEditMessage(msg.id, msg.message)
                                    }
                                  >
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      toast.warning("Confirm delete message?", {
                                        action: {
                                          label: "Confirm Delete",
                                          onClick: () =>
                                            handleDeleteMessage(msg.id),
                                        },
                                      });
                                    }}
                                  >
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {msg.edited && (
                        <span className="text-xs mr-4 text-gray-400">
                          {" "}
                          (edited)
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {moment(msg.timestamp).fromNow()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center">
            <TextInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
              className="flex-1 mr-4 p-2 rounded"
            />
            <Button
              onClick={handleSendMessage}
              variant="contained"
              color="primary"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
