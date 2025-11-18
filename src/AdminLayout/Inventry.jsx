import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchVideosAsync, selectVideos, selectLoading } from "../videoSlice";

const fallbackImage = "/fallback-thumb.png";

const VideoGallery = () => {
  const dispatch = useDispatch();
  const videos = useSelector(selectVideos);
  const loading = useSelector(selectLoading);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [fade, setFade] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  
  useEffect(() => {
    dispatch(fetchVideosAsync());
  }, [dispatch]);

  // Handle video selection
  const handleSelectVideo = (video) => {
    setFade(true);
    setVideoLoading(true);
    setTimeout(() => {
      setSelectedVideo(video);
      setFade(false);
    }, 300);
  };

  // Return fullscreen loading overlay
  if (loading) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-indigo-600 to-purple-700 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full border-8 border-t-8 border-white border-t-purple-600 h-24 w-24"></div>
      </div>
    );
  }

  // Render selected video fullscreen
  if (selectedVideo) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col p-4">
        <button
          onClick={() => setSelectedVideo(null)}
          className="mb-4 self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded shadow text-white"
        >
          &larr; Back to Gallery
        </button>
        <h2 className="mb-4 text-3xl font-semibold text-white text-center">{selectedVideo.name}</h2>
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
            Sorry, your browser doesn&apos;t support embedded videos.
          </video>
        </div>
      </div>
    );
  }

  // Render gallery grid (full window)
  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 bg-gray-100 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-indigo-900 mb-8">Video Gallery</h1>
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.length === 0 ? (
          <p className="w-full text-center text-gray-500 col-span-full">No videos available</p>
        ) : (
          videos.map((video) => (
            <div
              key={video.videoID}
              className="cursor-pointer rounded-lg shadow-md border border-gray-300 overflow-hidden"
              onClick={() => handleSelectVideo(video)}
              aria-label={`Select video ${video.name}`}
            >
              <div className="h-48 relative">
                <img
                  src={video.thumbnailImagePath || fallbackImage}
                  alt={video.name}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-sm px-2 py-1 truncate">
                  {video.name}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoGallery;
