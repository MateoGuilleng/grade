"use client";

import { useEffect, useState } from "react";

import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

import SortableRequestListReadOnly from "@/components/requestBoxesForClient";

import UserProfile from "@/components/UserProfile";

import {
  HiAdjustments,
  HiCloudDownload,
  HiUserCircle,
  HiStar,
  HiOutlineStar,
} from "react-icons/hi";

import {
  Button,
  Dropdown,
  TextInput,
  Modal,
  Textarea,
  Label,
  DropdownLabel,
  FileInput,
  Select,
} from "flowbite-react";
import { FaArrowLeft, FaPlus, FaPeopleArrows } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { SlOptionsVertical } from "react-icons/sl";
import { useUser } from "@auth0/nextjs-auth0/client";

function Page() {
  const [starIsClicked, setStarIsClicked] = useState(false);
  const [binaryStar, setBinaryStar] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCommentEditModal, setOpenCommentEditModal] = useState(false);

  const [users, setUsers] = useState([]);

  const [commentId, setCommentId] = useState();
  const [uploadModal, setUploadModal] = useState(false);
  const [error, setError] = useState();
  const { user, isLoading } = useUser();
  const [project, setProject] = useState({});
  const author = user?.email;
  const [lastWord, setLastWord] = useState("");
  const [commentText, setCommentText] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showUpEditCommentButton, setShowUpEditCommentButton] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false); // Estado para controlar la visibilidad del botón de carga de comentarios
  const [formFilled, setFormFilled] = useState(false);
  const [reqItems, setReqItems] = useState([]);

  const [message, setMessage] = useState("");

  const [projectId, setProjectId] = useState(null);

  const [requestBoxTitle, setRequestBoxTitle] = useState("");
  const [requestBoxCategory, setRequestBoxCategory] = useState("");
  const [requestFile, setRequestFile] = useState(null);
  const [requestBoxDescription, setRequestBoxDescription] = useState("");
  const router = useRouter();

  const [items, setItems] = useState([]);

  const getProject = async () => {
    const projectId = project._id;

    console.log(projectId);

    try {
      const res = await fetch(
        `/api/project/specificProject/${encodeURIComponent(lastWord)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("data", data);
        setProject(data);
        setItems(data.boxes);
        setReqItems(data.requestBoxes);
        setProjectId(data._id);
      } else {
        console.error("Failed to fetch projects:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching projects:", error.message);
    }
  };

  if (items == undefined) {
    getProject();
  } else {
    console.log("jejee");
  }

  console.log(projectId);
  useEffect(() => {
    getProject();
  }, []);

  const getFollowers = async () => {
    try {
      const res = await fetch(`/api/users/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("users", data);
        setUsers(data);
      } else {
        console.error("Failed to fetch projects:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching projects:", error.message);
    }
  };

  useEffect(() => {
    if (projectId !== null) {
      getFollowers();
    }
  }, [projectId]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath
      .split("/")
      .filter((part) => part.trim() !== "");

    // Obtener la penúltima palabra
    const penultimateWord =
      pathParts.length >= 2 ? pathParts[pathParts.length - 2] : "";

    // Establecer el estado lastWord con la penúltima palabra
    setLastWord(decodeURIComponent(penultimateWord));
    console.log("last word", lastWord);
  }, []);

  const handleRequestTitleChange = (e) => {
    setRequestBoxTitle(e.target.value);
  };

  const handleRequestCategoryChange = (e) => {
    setRequestBoxCategory(e.target.value);
  };
  const handleRequestFileChange = (e) => {
    setRequestFile(e.target.files[0]);
  };

  const handleRequestBoxDescriptionChange = (e) => {
    setRequestBoxDescription(e.target.value);
  };

  const handleRequestBoxSubmit = async (e) => {
    e.preventDefault();
    const author = await project.author;

    console.log("author", author);
    const formData = new FormData();
    formData.append("file", requestFile);
    formData.append("author", author);
    formData.append("projectID", project._id);
    formData.append("title", requestBoxTitle);
    formData.append("category", requestBoxCategory);
    formData.append("description", requestBoxDescription);

    const promise = () =>
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch("/api/boxes/request/uploadRequest", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          if (response.ok) {
            console.log("File uploaded successfully", result);

            toast.success("Box uploaded successfully", result);

            const newBox = {
              id: result.fileId,
              title: requestBoxTitle,
              category: requestBoxCategory,
              description: requestBoxDescription,
              filename: result.filename,
              filetype: result.filetype,
            };
            setBoxInfo(newBox);
            setItems((prevItems) => {
              const updatedItems = [...prevItems, newBox];
              console.log("Updated items:", updatedItems);
              return updatedItems;
            });

            resolve({ filename: result.filename });
          } else {
            console.error("Error uploading file:", result);
            reject(new Error("Error uploading file"));
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          reject(error);
        }
      });

    toast.promise(promise(), {
      loading: "Uploading...",
      success: (data) => {
        return `File uploaded successfully: ${data.filename}`;
      },
    });
  };

  useEffect(() => {
    if (project?.starredBy?.includes(user?.email)) {
      setStarIsClicked(true);
      setBinaryStar(1);
    } else {
      setStarIsClicked(false);
      setBinaryStar(0);
    }
  }, [project, isLoading]);

  const formatCreatedAt = (createdAt) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  const handleEditCommentInputChange = (e) => {
    const text = e.target.value;
    setNewComment(text);
    setShowUpEditCommentButton(text.trim().length > 0); // Mostrar el botón si hay texto en el área de comentario
  };
  const handleCommentInputChange = (e) => {
    const text = e.target.value;
    setCommentText(text);
    setShowUploadButton(text.trim().length > 0); // Mostrar el botón si hay texto en el área de comentario
  };

  const handleUploadComment = async (e) => {
    const author = user?.email;
    e.preventDefault();

    const formData = new FormData(e.target.closest("form")); // Accede al formulario más cercano al elemento que desencadenó el evento

    const comment = formData.get("comment");
    try {
      const res = await fetch(
        `/api/project/specificProject/${encodeURIComponent(lastWord)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment,
            author,
          }),
        }
      );

      if (res.status === 200) {
        setError("");
        window.location.reload();
        const { comments } = await res.json();
        console.log("¡Comentario agregado con éxito!");
        console.log("Comentarios:", comments);
      }
    } catch (error) {
      setError("Something went wrong, try again");
      console.log(error);
    }
  };

  const handleDeleteComment = async () => {
    console.log(commentId);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(lastWord)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
        }),
      });
      if (res.ok) {
        // Redirige a la misma página para refrescar
        window.location.reload();
      } else {
        console.error("Failed to delete comment:", res.statusText);
      }
    } catch (error) {
      console.error("Error deleting comment:", error.message);
    }
  };

  const handleUploadEditComment = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target.closest("form")); // Accede al formulario más cercano al elemento que desencadenó el evento

    const newComment = formData.get("newComment");

    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(lastWord)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          newComment,
        }),
      });

      if (res.ok) {
        setError("");

        const { comments } = await res.json();
        console.log("¡Comentario agregado con éxito!");
        console.log("Comentarios:", comments);
        window.location.reload();
      }
    } catch (error) {
      setError("Something went wrong, try again");
      console.log(error);
    }
  };

  const projectComments = project?.comments;
  return (
    <div>
      <Navbar />

      <div className="bg-white dark:bg-black w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row text-black dark:text-white">
        <div className="w-full">
          <div className="m-10 sm:flex-row-reverse mb-0 text-2xl border-b pb-5 flex flex-col gap-6 justify-between border-indigo-100 font-semibold">
            <div className="flex w-full flex-wrap sm:flex-nowrap justify-between">
              <div className="flex flex-wrap sm:w-full">
                <div className="text-3xl sm:text-5xl sm:w-fit  w-full sm:order-first">
                  <div className="flex flex-wrap align-middle items-center justify-between">
                    <div className="flex gap-3">
                      <button className="align-middle" onClick={router.back}>
                        <FaArrowLeft />{" "}
                      </button>{" "}
                      <h2 className="sm:text-4xl sm:w-fit align-middle">
                        People: {project?.title}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="m-10 mt-0">
            <div className="">
              <Button.Group className="flex-wrap">
                <Button
                  onClick={() =>
                    router.replace(`/${project.author}/${project.title}`)
                  }
                >
                  <HiUserCircle className="mr-3 h-4 w-4 text-black dark:text-white" />
                  <p className="text-black dark:text-white">Overview</p>
                </Button>
                <>
                  <Button onClick={() => setOpenModal(true)}>
                    <HiCloudDownload className="mr-3 h-4 w-4 text-black dark:text-white" />
                    <p className="text-black dark:text-white">Comments</p>
                  </Button>
                  <Modal
                    dismissible
                    className="bg-black/75 w-screen"
                    show={openModal}
                    onClose={() => setOpenModal(false)}
                  >
                    <Modal.Header className="bg-black border-2">
                      <form action="" onSubmit={handleUploadComment}>
                        <div className="w-full">
                          <div className="mb-2 ">
                            <Label
                              className="text-xl"
                              htmlFor="comment"
                              value="Leave a comment:"
                            />
                          </div>
                          <Textarea
                            className="mt-5"
                            id="comment"
                            name="comment"
                            placeholder="give an opinion about the project..."
                            required
                            rows={4}
                            value={commentText}
                            onChange={handleCommentInputChange}
                          />

                          {error}
                          {showUploadButton && ( // Mostrar el botón de carga de comentarios si hay texto en el área de comentario
                            <Button type="submit" className="mt-3">
                              Upload Comment
                            </Button>
                          )}
                        </div>
                      </form>
                    </Modal.Header>
                    <Modal.Body className="max-h-[400px] overflow-y-auto bg-black border-2 border-white/30">
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold">
                          Comments: ({projectComments?.length})
                        </h3>
                        {project?.comments &&
                          project.comments.map((comment, index) => (
                            <div
                              key={index}
                              className="border-b-2 border-white/25 p-3 rounded"
                            >
                              <div className="flex">
                                <img
                                  alt="Bonnie image"
                                  src={comment.authorProfileImage}
                                  className="mb-3 rounded-full shadow-lg w-14 h-14"
                                />
                                <div className="flex flex-col w-full ml-4">
                                  <div
                                    onClick={() => {
                                      setCommentId(comment.id);
                                      console.log(commentId);
                                    }}
                                    className="flex justify-between w-full"
                                  >
                                    <div>
                                      <p>
                                        <a
                                          className="hover:border-b-2"
                                          href={`profile/${author}`}
                                        >
                                          <strong className="text-md ">
                                            {comment.authorFN}{" "}
                                            {comment.authorLN}{" "}
                                            {user?.email == comment.author
                                              ? "(you)"
                                              : ""}
                                          </strong>{" "}
                                        </a>
                                        <p className="text-xs text-gray-400">
                                          {comment.author}
                                        </p>
                                      </p>
                                    </div>
                                    <>
                                      <Modal
                                        dismissible={false} // Evitar que se cierre haciendo clic fuera del modal
                                        className="bg-black/50"
                                        show={openCommentEditModal}
                                        onClose={() => {
                                          setOpenCommentEditModal(false);
                                        }}
                                      >
                                        <Modal.Header className="">
                                          <form
                                            action=""
                                            onSubmit={handleUploadEditComment}
                                          >
                                            <div className="w-full">
                                              <div className="mb-2">
                                                <Label
                                                  className="text-xl"
                                                  htmlFor="comment"
                                                  value="Edit This Comment:"
                                                />
                                              </div>

                                              <Textarea
                                                className="mt-5"
                                                id="newComment"
                                                name="newComment"
                                                placeholder={comment.comment}
                                                required
                                                rows={4}
                                                value={newComment}
                                                onChange={
                                                  handleEditCommentInputChange
                                                }
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                } // Evitar que se cierre al hacer clic dentro del textarea
                                              />

                                              {error}
                                              {showUpEditCommentButton && (
                                                <Button
                                                  type="submit"
                                                  className="mt-3"
                                                >
                                                  Edit Comment
                                                </Button>
                                              )}
                                            </div>
                                          </form>
                                        </Modal.Header>
                                      </Modal>
                                    </>
                                    <div className="self-end">
                                      <Dropdown
                                        label=""
                                        dismissOnClick={false}
                                        onClick={() => {
                                          setCommentId(comment.id);
                                          console.log(comment.id);
                                        }}
                                        renderTrigger={() => (
                                          <span>
                                            <SlOptionsVertical />
                                          </span>
                                        )}
                                      >
                                        {user?.email == comment.author ? (
                                          <div>
                                            <Dropdown.Item>
                                              Copy Link
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                              <Button
                                                className="w-full h-full"
                                                onClick={() => {
                                                  setOpenCommentEditModal(true);
                                                  setCommentId(comment?.id);
                                                }}
                                              >
                                                Edit Comment
                                              </Button>
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                              Follow Comment
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                              onClick={async () => {
                                                await setCommentId(comment.id);
                                                console.log(commentId);
                                                handleDeleteComment();
                                              }}
                                            >
                                              Remove Comment
                                            </Dropdown.Item>
                                          </div>
                                        ) : (
                                          <div>
                                            <Dropdown.Item>
                                              Copy Link
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                              Follow Comment
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                              Report Comment
                                            </Dropdown.Item>
                                          </div>
                                        )}
                                      </Dropdown>
                                    </div>
                                  </div>
                                  <p className="text-xs mt-2 text-gray-400">
                                    {formatCreatedAt(comment.createdAt)}{" "}
                                    {comment.edited ? "(Edited)" : ""}{" "}
                                  </p>
                                  <p className="mt-10"> {comment.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Modal.Body>
                  </Modal>
                </>

                <Button className="" color="" onClick={() => router.refresh()}>
                  <HiAdjustments className="mr-3 h-4 w-4" />
                  Requests
                </Button>
                {project?.author == author ? (
                  <Button
                    color=""
                    onClick={() =>
                      router.push(
                        `/dashboard/projects/${encodeURIComponent(
                          project?.title
                        )}`
                      )
                    }
                  >
                    <HiAdjustments className="mr-3 h-4 w-4" />
                    Edit Project
                  </Button>
                ) : (
                  ""
                )}
                <Button className="block sm:hidden" color="">
                  <FaPeopleArrows className="mr-3 h-4 w-4 " />
                  People
                </Button>
              </Button.Group>
            </div>
            <div className="flex items-center gap-5 mb-5">
              <h1 className="text-2xl font-bold">Owner: </h1>{" "}
              <a className="hover:border-b-2" href={`${project.author}`}>
                {project?.author}
              </a>
            </div>
            <div className="flex">
              <h1 className="text-2xl font-bold">Followers:</h1>
            </div>
            <div className="flex max-w-full gap-6 overflow-x-scroll pb-6">
              {users?.map((user) => (
                <UserProfile key={user._id} userData={user} />
              ))}
              <p className="m-5">{users.length <= 0 ? "No users found" : ""}</p>
            </div>
          </main>
        </div>
        <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block">
          <div className="sticky flex flex-col gap-2 p-4 text-sm  top-12">
            <a
              href="/dashboard"
              className="flex items-center px-3 py-2.5 font-semibold hover:border hover:rounded-full  "
            >
              Project info
            </a>

            <a
              href={`${encodeURIComponent(lastWord)}/social`}
              className="flex items-center px-3 py-2.5 font-bol bg-slate-200  text-black border rounded-full"
            >
              People
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Page;
