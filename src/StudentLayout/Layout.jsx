import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchVideosAsync, selectVideos, selectLoading } from "../videoSlice";

const fallbackImage = "/fallback-thumb.png";

function Header() {
  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-20">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Profile */}
        <div className="flex items-center space-x-4">
          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            className="w-10 h-10 rounded-full ring-2 ring-indigo-500 hover:ring-indigo-700 transition"
          />
          <span className="font-semibold text-gray-700">John Doe</span>
        </div>
        {/* Search */}
        <div className="flex-1 mx-8 max-w-xl">
          <input
            type="search"
            placeholder="Search videos..."
            className="
              w-full px-4 py-2 rounded-full border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              transition placeholder-gray-400 text-gray-700
              shadow-sm focus:shadow-md
            "
            aria-label="Search videos"
          />
        </div>
        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-full hover:bg-indigo-100 transition"
        >
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
          </svg>
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-white shadow-inner border-t border-gray-200 z-20">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-around text-gray-600">
        <button className="flex flex-col items-center hover:text-indigo-600 transition">
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"></path>
            <path d="M5 10v10a1 1 0 001 1h3m10-11l2 2"></path>
          </svg>
          <span className="text-xs font-semibold">Home</span>
        </button>
        <button className="flex flex-col items-center hover:text-indigo-600 transition">
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <span className="text-xs font-semibold">Watch</span>
        </button>
        <button className="flex flex-col items-center hover:text-indigo-600 transition">
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12h-6m-6 0H3m18 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-xs font-semibold">Browse</span>
        </button>
      </div>
    </footer>
  );
}

function VideoGallery() {
  const dispatch = useDispatch();
  const videos = useSelector(selectVideos);
  const loading = useSelector(selectLoading);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [localVideos, setLocalVideos] = useState([]);

  React.useEffect(() => {
    dispatch(fetchVideosAsync());
  }, [dispatch]);

  React.useEffect(() => {
    setLocalVideos(videos);
  }, [videos]);

  // Helper to update one video in localVideos state immutably
  function updateLocalVideo(updatedVideo) {
    setLocalVideos((prev) =>
      prev.map((v) => (v.videoID === updatedVideo.videoID ? updatedVideo : v))
    );
  }

  // Handle like toggle locally and update both selectedVideo and localVideos array
  function handleLike(videoID) {
    setSelectedVideo((prevSelected) => {
      if (!prevSelected) return prevSelected;
      const liked = prevSelected.likedByUser;
      const updated = {
        ...prevSelected,
        likedByUser: !liked,
        likeCount: liked ? prevSelected.likeCount - 1 : prevSelected.likeCount + 1,
      };
      updateLocalVideo(updated);
      // TODO: Add API dispatch for persisting like/unlike
      return updated;
    });
  }

  // Handle adding comment locally and update both states
  function handleAddComment(videoID, comment) {
    if (!comment.trim()) return;
    setSelectedVideo((prevSelected) => {
      if (!prevSelected) return prevSelected;
      const newComment = { username: "You", text: comment }; // Replace with actual user
      const updated = {
        ...prevSelected,
        commentCount: (prevSelected.commentCount || 0) + 1,
        comments: [...(prevSelected.comments || []), newComment],
      };
      updateLocalVideo(updated);
      setCommentText("");
      // TODO: Add API dispatch for persisting comment
      return updated;
    });
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-indigo-600 to-purple-700 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full border-8 border-t-8 border-white border-t-purple-600 h-24 w-24"></div>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col p-4 z-30">
        <div className="flex items-center mb-4">
          <button
            onClick={() => {
              setSelectedVideo(null);
              setVideoLoading(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded shadow text-white font-semibold flex items-center"
            aria-label="Back to Gallery"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <h2 className="ml-4 text-2xl font-semibold text-white">{selectedVideo.name}</h2>
        </div>
        <div className="flex-1 relative rounded-lg shadow-lg overflow-hidden bg-black">
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-70">
              <div className="w-12 h-12 border-4 border-white border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}
          <video
            key={selectedVideo.videoID}
            src={selectedVideo.videoPath}
            controls
            autoPlay
            poster={selectedVideo.thumbnailImagePath || fallbackImage}
            className="w-full h-full object-contain"
            onLoadedData={() => setVideoLoading(false)}
          >
            Sorry, your browser doesn't support embedded videos.
          </video>
        </div>

        {/* Video Actions: Like & Counts */}
        <div className="flex items-center space-x-6 my-4">
          <button
            className={`flex items-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded transition focus:outline-none ${
              selectedVideo.likedByUser ? "ring-2 ring-pink-400" : ""
            }`}
            onClick={() => handleLike(selectedVideo.videoID)}
          >
            <svg
              className={`w-5 h-5 mr-2 ${selectedVideo.likedByUser ? "animate-pulse" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656l-6.364 6.363a1 1 0 01-1.414 0l-6.363-6.363a4 4 0 010-5.656z"></path>
            </svg>
            Like {selectedVideo.likeCount}
          </button>
          <span className="text-gray-200 font-semibold">Comments {selectedVideo.commentCount}</span>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-inner p-4 mt-2 max-h-64 overflow-y-auto">
          <h3 className="text-lg font-bold text-indigo-700 mb-2">Comments</h3>
          {selectedVideo.comments && selectedVideo.comments.length > 0 ? (
            selectedVideo.comments.map((cmt, idx) => (
              <div key={idx} className="mb-3 flex items-start">
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-300 flex items-center justify-center font-bold text-white mr-3 select-none">
                  {cmt.username[0]?.toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">{cmt.username}</span>
                  <p className="text-gray-600">{cmt.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          )}
          <div className="mt-4 flex items-center">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r font-semibold"
              onClick={() => handleAddComment(selectedVideo.videoID, commentText)}
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 bg-gray-100 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-indigo-900 mb-8">Video Gallery</h1>
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {localVideos.length === 0 ? (
          <p className="w-full text-center text-gray-500 col-span-full">No videos available</p>
        ) : (
          localVideos.map((video) => (
            <div
              key={video.videoID}
              className="cursor-pointer rounded-lg shadow-md border border-gray-300 overflow-hidden hover:scale-105 transition-transform duration-150"
              onClick={() => {
                setSelectedVideo(video);
                setVideoLoading(true);
              }}
              aria-label={`Select video ${video.name}`}
            >
              <div className="h-48 relative">
                <img
                  src={video.thumbnailImagePath || fallbackImage}
                  alt={video.name}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute w-full bottom-0 left-0 flex items-center justify-between px-2 py-1 bg-black bg-opacity-50 text-white text-sm">
                  <span className="truncate">{video.name}</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-pink-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656l-6.364 6.363a1 1 0 01-1.414 0l-6.363-6.363a4 4 0 010-5.656z"></path>
                      </svg>
                      {video.likeCount}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 15a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v5l4-5h7z" />
                      </svg>
                      {video.commentCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <VideoGallery />
      </main>
      <Footer />
    </div>
  );
}
