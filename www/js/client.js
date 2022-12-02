"use strict"; // https://www.w3schools.com/js/js_strict.asp

const welcomeImg = "../images/illustration-section-01.svg";
const shareUrlImg = "../images/illustration-section-01.svg";
const leaveRoomImg = "../images/illustration-section-01.svg";
const confirmImg = "../images/illustration-section-01.svg";
const fileSharingImg = "../images/illustration-section-01.svg";
const aboutImg = "../images/about.png";
const peerLoockupUrl = "https://extreme-ip-lookup.com/json/";
const avatarApiUrl = "https://eu.ui-avatars.com/api";
const fileSharingInput = "*"; // allow all file extensions
// "image/*,.mp3,.doc,.docs,.txt,.pdf,.xls,.xlsx,.csv,.pcap,.xml,.json,.md,.html,.js,.css,.php,.py,.sh,.zip,.rar,.tar"; // "*"
const isWebRTCSupported = DetectRTC.isWebRTCSupported;
const isMobileDevice = DetectRTC.isMobileDevice;

let leftChatAvatar;
let rightChatAvatar;

let callStartTime;
let callElapsedTime;
let recElapsedTime;
let microsoftTeams = "default"; // default theme
let swalBackground = "#7b83eb"; // teams theme blue
let signalingServerPort = 3000; // same as server port
let signalingServer = getServerUrl();
let roomId = getRoomId();
let peerInfo = getPeerInfo();
let peerGeo;
let peerConnection;
let myPeerName;
let useAudio = true;
let useVideo = true;
let camera = "user";
let myVideoChange = false;
let myHandStatus = false;
let myVideoStatus = true;
let myAudioStatus = true;
let isScreenStreaming = false;
let isChatRoomVisible = false;
let isChatEmojiVisible = false;
let isButtonsVisible = false;
let isVideoOnFullScreen = false;
let isDocumentOnFullScreen = false;
let isWhiteboardFs = false;
let signalingSocket; // socket.io connection to the webserver
let localMediaStream; // admin's video and audio
let remoteMediaStream; // peers video and audio
let remoteMediaControls = false; // enable - disable peers video player controls (default false)
let peerConnections = {}; // keep track of the peer connections, indexed by peer_id == socket.io id
let chatDataChannels = {}; // keep track of the peer chat data channels
let fileSharingDataChannels = {}; // keep track of the peer file sharing data channels
let useRTCDataChannel = true; // https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
let peerMediaElements = {}; // keep track of peer <video> tags, indexed by peer_id
let chatMessages = []; // collect/download chat messages to save it later if want
let iceServers = [{ urls: "stun:stun.l.google.com:19302" }]; // backup iceServers

let chatInputEmoji = {
  "<3": "\u2764\uFE0F",
  "</3": "\uD83D\uDC94",
  ":D": "\uD83D\uDE00",
  ":)": "\uD83D\uDE03",
  ";)": "\uD83D\uDE09",
  ":(": "\uD83D\uDE12",
  ":p": "\uD83D\uDE1B",
  ";p": "\uD83D\uDE1C",
  ":'(": "\uD83D\uDE22",
  ":+1:": "\uD83D\uDC4D",
}; // https://github.com/wooorm/gemoji/blob/main/support.md

let countTime;
// init audio-video
let initAudioToggleBtn;
let initVideoToggleBtn;
// left buttons
let leftButtons;
let shareTeamBtn;
let audioToggleBtn;
let videoToggleBtn;
let shareScreenBtn;
let fullScreenBtn;
let chatRoomBtn;
let myHandBtn;
let whiteboardBtn;
let fileShareBtn;
let leaveRoomBtn;
// chat/messenger room elements
let messengerDrag;
let messengerHeader;
let messengerTheme;
let messengerCPBtn;
let messengerClean;
let messengerSaveBtn;
let messengerClose;
let messengerChat;
let messengerEmojiBtn;
let messengerInput;
let messengerSendBtn;
// chat room connected peers
let messengerCP;
let messengerCPHeader;
let messengerCPCloseBtn;
let messengerCPList;
// chat room emoji picker
let messengerEmojiPicker;
let messengerEmojiHeader;
let messengerCloseEmojiBtn;
let emojiPicker;
let myVideo;
// name && hand video audio status
let myVideoParagraph;
let myHandStatusIcon;
let myVideoStatusIcon;
let myAudioStatusIcon;

// whiteboard init
let whiteboardCont;
let whiteboardHeader;
let whiteboardColorPicker;
let whiteboardCloseBtn;
let whiteboardFsBtn;
let whiteboardCleanBtn;
let whiteboardSaveBtn;
let whiteboardEraseBtn;
let isWhiteboardVisible = false;
let canvas;
let ctx;
// whiteboard settings
let isDrawing = 0;
let x = 0;
let y = 0;
let color = "#000000";
let drawsize = 3;

// file transfer settings
let fileToSend;
let fileReader;
let receiveBuffer = [];
let receivedSize = 0;
let incomingFileInfo;
let incomingFileData;
let shareFileDiv;
let shareFileInfo;
let progressReport;
let sendAbortBtn;
let sendInProgress = false;
let fsDataChannelOpen = false;
const chunkSize = 16 * 1024; //16kb

let videoSelect;
let audioInputSelect;
/**
 * Load all Html elements by Id
 */
function getHtmlElementsById() {
  countTime = getId("countTime");
  myVideo = getId("myVideo");
  // left buttons
  leftButtons = getId("leftButtons");
  shareTeamBtn = getId("shareTeamBtn");
  audioToggleBtn = getId("audioToggleBtn");
  videoToggleBtn = getId("videoToggleBtn");
  shareScreenBtn = getId("shareScreenBtn");
  fullScreenBtn = getId("fullScreenBtn");
  chatRoomBtn = getId("chatRoomBtn");
  whiteboardBtn = getId("whiteboardBtn");
  fileShareBtn = getId("fileShareBtn");
  myHandBtn = getId("myHandBtn");
  leaveRoomBtn = getId("leaveRoomBtn");
  // chat Room elements
  messengerDrag = getId("messengerDrag");
  messengerHeader = getId("messengerHeader");
  messengerTheme = getId("messengerTheme");
  messengerCPBtn = getId("messengerCPBtn");
  messengerClean = getId("messengerClean");
  messengerSaveBtn = getId("messengerSaveBtn");
  messengerClose = getId("messengerClose");
  messengerChat = getId("messengerChat");
  messengerEmojiBtn = getId("messengerEmojiBtn");
  messengerInput = getId("messengerInput");
  messengerSendBtn = getId("messengerSendBtn");
  // chat room connected peers
  messengerCP = getId("messengerCP");
  messengerCPHeader = getId("messengerCPHeader");
  messengerCPCloseBtn = getId("messengerCPCloseBtn");
  messengerCPList = getId("messengerCPList");
  // chat room emoji picker
  messengerEmojiPicker = getId("messengerEmojiPicker");
  messengerEmojiHeader = getId("messengerEmojiHeader");
  messengerCloseEmojiBtn = getId("messengerCloseEmojiBtn");
  emojiPicker = getSl("emoji-picker");
  // my conference name, hand, video - audio status
  myVideoParagraph = getId("myVideoParagraph");
  myHandStatusIcon = getId("myHandStatusIcon");
  myVideoStatusIcon = getId("myVideoStatusIcon");
  myAudioStatusIcon = getId("myAudioStatusIcon");
  // my whiteboard
  whiteboardCont = getSl(".whiteboard-cont");
  whiteboardHeader = getSl(".colors-container");
  whiteboardCloseBtn = getId("whiteboardCloseBtn");
  whiteboardFsBtn = getId("whiteboardFsBtn");
  whiteboardColorPicker = getId("whiteboardColorPicker");
  whiteboardSaveBtn = getId("whiteboardSaveBtn");
  whiteboardEraseBtn = getId("whiteboardEraseBtn");
  whiteboardCleanBtn = getId("whiteboardCleanBtn");
  canvas = getId("whiteboard");
  ctx = canvas.getContext("2d");

  // file send progress
  shareFileDiv = getId("shareFileDiv");
  shareFileInfo = getId("shareFileInfo");
  progressReport = getId("progressReport");
  sendAbortBtn = getId("sendAbortBtn");
}
const videoElem = document.getElementById("video");
videoSelect = getId("videoSource");
audioInputSelect = getId("audioSource");
/**
 * Tippy.js for js functionality
 * https://atomiks.github.io/tippyjs/
 */
function setButtonsTitle() {
  // no need if not mobile
  if (isMobileDevice) return;

  // left buttons
  tippy(shareTeamBtn, {
    content: "Invite people",
    placement: "right-start",
  });
  tippy(audioToggleBtn, {
    content: "Click to audio OFF",
    placement: "right-start",
  });
  tippy(videoToggleBtn, {
    content: "Click to video OFF",
    placement: "right-start",
  });
  tippy(shareScreenBtn, {
    content: "Share your screen",
    placement: "right-start",
  });
  tippy(fullScreenBtn, {
    content: "VIEW full screen",
    placement: "right-start",
  });
  tippy(chatRoomBtn, {
    content: "OPEN the chat",
    placement: "right-start",
  });
  tippy(myHandBtn, {
    content: "RAISE hand",
    placement: "right-start",
  });
  tippy(whiteboardBtn, {
    content: "OPEN the whiteboard",
    placement: "right-start",
  });
  tippy(fileShareBtn, {
    content: "SHARE the file",
    placement: "right-start",
  });
  tippy(leaveRoomBtn, {
    content: "Leave this room",
    placement: "right-start",
  });

  // chat room buttons

  tippy(messengerCPBtn, {
    content: "Private messages",
  });
  tippy(messengerClean, {
    content: "Clean messages",
  });
  tippy(messengerSaveBtn, {
    content: "Save messages",
  });
  tippy(messengerClose, {
    content: "Close the chat",
  });
  tippy(messengerEmojiBtn, {
    content: "Emoji",
  });
  tippy(messengerSendBtn, {
    content: "Send",
  });

  // emoji picker button
  tippy(messengerCloseEmojiBtn, {
    content: "Close emoji",
  });

  // whiteboard buttons
  tippy(whiteboardCloseBtn, {
    content: "CLOSE the whiteboard",
    placement: "bottom",
  });
  tippy(whiteboardFsBtn, {
    content: "VIEW full screen",
    placement: "bottom",
  });
  tippy(whiteboardColorPicker, {
    content: "COLOR picker",
    placement: "bottom",
  });
  tippy(whiteboardSaveBtn, {
    content: "SAVE the board",
    placement: "bottom",
  });
  tippy(whiteboardEraseBtn, {
    content: "ERASE the board",
    placement: "bottom",
  });
  tippy(whiteboardCleanBtn, {
    content: "CLEAN the board",
    placement: "bottom",
  });

  // stop file sender button
  tippy(sendAbortBtn, {
    content: "ABORT file transfer",
    placement: "right-start",
  });
}

/**
 * Get basic peer info using DetecRTC
 * https://github.com/muaz-khan/DetectRTC
 */
function getPeerInfo() {
  return {
    detectRTCversion: DetectRTC.version,
    isWebRTCSupported: DetectRTC.isWebRTCSupported,
    isMobileDevice: DetectRTC.isMobileDevice,
    osName: DetectRTC.osName,
    osVersion: DetectRTC.osVersion,
    browserName: DetectRTC.browser.name,
    browserVersion: DetectRTC.browser.version,
  };
}

/**
 * Peer Geolocation
 * @return json
 */
function getPeerGeoLocation() {
  fetch(peerLoockupUrl)
    .then((res) => res.json())
    .then((outJson) => {
      peerGeo = outJson;
    })
    .catch((err) => console.error(err));
}

/**
 * Server URL
 * @return Signaling server Url
 */
function getServerUrl() {
  return (
    "http" +
    (location.hostname == "192.168.1.8" ? "" : "s") +
    "://" +
    location.hostname +
    (location.hostname == "192.168.1.8" ? ":" + signalingServerPort : "")
  );
}

/**
 * Random Team ID
 * @return Team ID
 */
function getRoomId() {
  // skip /join/
  let roomId = location.pathname.substring(6);
  // if not specified room id, create one random
  if (roomId == "") {
    roomId = makeId(12);
    const newurl = signalingServer + "/join/" + roomId;
    window.history.pushState({ url: newurl }, roomId, newurl);
  }
  return roomId;
}

/**
 * Generate random Id
 * @returns random id
 */
function makeId(length) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Check for established peer conections
 * @return true, otherwise false
 */
function thereIsPeerConnections() {
  if (Object.keys(peerConnections).length === 0) {
    return false;
  }
  return true;
}

/**
 * Get started
 */
function initPeer() {
  // set Teams theme
  setTheme(microsoftTeams);

  // check if peer's browser supports WebRTC
  if (!isWebRTCSupported) {
    console.error("isWebRTCSupported: false");
    userLog("error", "This browser seems not supported WebRTC!");
    return;
  }

  // peer ready for WebRTC
  console.log("Connecting to signaling server");
  signalingSocket = io(signalingServer);

  /**
   * As soon as peer gives permission to their audio and video
   * start peering up!
   */
  signalingSocket.on("connect", () => {
    console.log("Connected to signaling server");
    if (localMediaStream) joinToChannel();
    else
      setupLocalMedia(() => {
        whoAreYou();
      });
  });

  /**
   * Set name for meeting (mandatory)
   */
  function whoAreYou() {
    Swal.fire({
      allowOutsideClick: false,
      background: swalBackground,
      position: "center",
      imageAlt: "Teams-name",
      imageUrl: welcomeImg,
      title: "Please enter your name",
      input: "text",
      html: `<br>
        <button id="initAudioToggleBtn" class="fas fa-microphone" onclick="handleAudio(event, true)"></button>
        <button id="initVideoToggleBtn" class="fas fa-video" onclick="handleVideo(event, true)"></button>   
      `,
      confirmButtonText: `Join Team`,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
      inputValidator: (value) => {
        if (!value) {
          return "Please enter name to continue";
        }
        myPeerName = value;
        myVideoParagraph.innerHTML = myPeerName + " (me)";
        setPeerAvatarImgName("myVideoAvatarImage", myPeerName);
        setPeerChatAvatarImgName("right", myPeerName);
        joinToChannel();
      },
    }).then(() => {
      welcomeUser();
    });

    // only for mobile device
    if (isMobileDevice) return;
    // init audio-video
    initAudioToggleBtn = getId("initAudioToggleBtn");
    initVideoToggleBtn = getId("initVideoToggleBtn");
    // popup text
    tippy(initAudioToggleBtn, {
      content: "Click to audio OFF",
      placement: "top",
    });
    tippy(initVideoToggleBtn, {
      content: "Click to video OFF",
      placement: "top",
    });
  }

  /**
   * peer info and geolocation
   */
  function joinToChannel() {
    console.log("join to channel", roomId);
    signalingSocket.emit("join", {
      channel: roomId,
      peerInfo: peerInfo,
      peerGeo: peerGeo,
      peerName: myPeerName,
      peerVideo: myVideoStatus,
      peerAudio: myAudioStatus,
      peerHand: myHandStatus,
    });
  }

  /**
   * welcome
   */
  function welcomeUser() {
    const myRoomUrl = window.location.href;
    Swal.fire({
      background: swalBackground,
      position: "center",
      title: "<strong>Welcome " + myPeerName + "</strong>",
      imageAlt: "teams-welcome",
      imageUrl: welcomeImg,
      html:
        `
      <br/> 
      <p style="color:white;">Share this teams invite for others to join.</p>
      <p style="color:rgb(255, 255, 255);">` +
        myRoomUrl +
        `</p>`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Copy teams URL`,
      denyButtonText: `Invite via Email`,
      cancelButtonText: `Close`,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        copyRoomURL();
      } else if (result.isDenied) {
        let message = {
          email: "",
          subject: "Please join our Microsoft Teams Video Chat Meeting",
          body: "Click here to join: " + myRoomUrl,
        };
        shareRoomByEmail(message);
      }
    });
  }

  /**
   *When you join a group an addPeer event will be sent to all the memebers
   * and a graph of peers will be made. If 4 people are there in the call then you
   * will be connected to the other 3 directly
   */
  signalingSocket.on("addPeer", (config) => {
    // console.log("addPeer", JSON.stringify(config));

    let peer_id = config.peer_id;
    let peers = config.peers;

    if (peer_id in peerConnections) {
      // If a peer tries to join multiple channels
      console.log("Already connected to peer", peer_id);
      return;
    }

    if (config.iceServers) iceServers = config.iceServers;
    console.log("iceServers", iceServers[0]);

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
    peerConnection = new RTCPeerConnection({ iceServers: iceServers });

    // collect peer connections
    peerConnections[peer_id] = peerConnection;

    // adding peer for private message list
    messengerAddPeers(peers);

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
    peerConnections[peer_id].onicecandidate = (event) => {
      if (event.candidate) {
        signalingSocket.emit("relayICE", {
          peer_id: peer_id,
          ice_candidate: {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            candidate: event.candidate.candidate,
            address: event.candidate.address,
          },
        });
      }
    };

    /**
     * WebRTC: onaddstream is deprecated! Use peerConnection.ontrack instead (done)
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onaddstream
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
     */
    let ontrackCount = 0;
    peerConnections[peer_id].ontrack = (event) => {
      ontrackCount++;
      if (ontrackCount === 2) {
        console.log("ontrack", event);
        remoteMediaStream = event.streams[0];

        const videoWrap = document.createElement("div");

        // handle peer's statuses
        const remoteStatusMenu = document.createElement("div");
        const remoteVideoParagraphImg = document.createElement("i");
        const remoteVideoParagraph = document.createElement("h4");
        const remoteHandStatusIcon = document.createElement("button");
        const remoteVideoStatusIcon = document.createElement("button");
        const remoteAudioStatusIcon = document.createElement("button");
        const remotePeerKickOut = document.createElement("button");
        const remoteVideoFullScreenBtn = document.createElement("button");
        const remoteVideoAvatarImage = document.createElement("img");

        // menu Status
        remoteStatusMenu.setAttribute("id", peer_id + "_menuStatus");
        remoteStatusMenu.className = "statusMenu";

        // peer name element
        remoteVideoParagraphImg.setAttribute("id", peer_id + "_nameImg");
        remoteVideoParagraphImg.className = "fas fa-user";
        remoteVideoParagraph.setAttribute("id", peer_id + "_name");
        remoteVideoParagraph.className = "videoPeerName";
        tippy(remoteVideoParagraph, {
          content: "Participant name",
        });
        const peerVideoText = document.createTextNode(
          peers[peer_id]["peer_name"]
        );
        remoteVideoParagraph.appendChild(peerVideoText);
        // hand status
        remoteHandStatusIcon.setAttribute("id", peer_id + "_handStatus");
        remoteHandStatusIcon.style.setProperty("color", "rgb(166, 141, 214)");
        remoteHandStatusIcon.className = "fas fa-hand-paper pulsate";
        tippy(remoteHandStatusIcon, {
          content: "Participant hand is RAISED",
        });
        // video status
        remoteVideoStatusIcon.setAttribute("id", peer_id + "_videoStatus");
        remoteVideoStatusIcon.className = "fas fa-video";
        tippy(remoteVideoStatusIcon, {
          content: "Participant video is ON",
        });
        // audio status
        remoteAudioStatusIcon.setAttribute("id", peer_id + "_audioStatus");
        remoteAudioStatusIcon.className = "fas fa-microphone";
        tippy(remoteAudioStatusIcon, {
          content: "Participant audio is ON",
        });
        // peer kick out
        remotePeerKickOut.setAttribute("id", peer_id + "_kickOut");
        remotePeerKickOut.className = "fas fa-sign-out-alt";
        tippy(remotePeerKickOut, {
          content: "Kick out",
        });
        // video full screen
        remoteVideoFullScreenBtn.setAttribute("id", peer_id + "_fullScreen");
        remoteVideoFullScreenBtn.className = "fas fa-expand";
        tippy(remoteVideoFullScreenBtn, {
          content: "Full screen mode",
        });
        // my video avatar image
        remoteVideoAvatarImage.setAttribute("id", peer_id + "_avatar");
        remoteVideoAvatarImage.className = "videoAvatarImage pulsate";

        // add elements to remoteStatusMenu div
        remoteStatusMenu.appendChild(remoteVideoParagraphImg);
        remoteStatusMenu.appendChild(remoteVideoParagraph);
        remoteStatusMenu.appendChild(remoteHandStatusIcon);
        remoteStatusMenu.appendChild(remoteVideoStatusIcon);
        remoteStatusMenu.appendChild(remoteAudioStatusIcon);
        remoteStatusMenu.appendChild(remotePeerKickOut);
        remoteStatusMenu.appendChild(remoteVideoFullScreenBtn);

        // add elements to videoWrap div
        videoWrap.appendChild(remoteStatusMenu);
        videoWrap.appendChild(remoteVideoAvatarImage);

        const remoteMedia = document.createElement("video");
        videoWrap.className = "video";
        videoWrap.appendChild(remoteMedia);
        remoteMedia.setAttribute("id", peer_id + "_video");
        remoteMedia.setAttribute("playsinline", true);
        remoteMedia.mediaGroup = "remotevideo";
        remoteMedia.autoplay = true;
        isMobileDevice
          ? (remoteMediaControls = false)
          : (remoteMediaControls = remoteMediaControls);
        remoteMedia.controls = remoteMediaControls;
        peerMediaElements[peer_id] = remoteMedia;
        document.body.appendChild(videoWrap);

        // attachMediaStream is a part of the adapter.js library
        attachMediaStream(remoteMedia, remoteMediaStream);
        // resize video elements
        resizeVideos();

        // handle video full screen mode
        handleVideoPlayerFs(peer_id + "_video", peer_id + "_fullScreen");
        // handle kick out button
        handlePeerKickOutBtn(peer_id);
        // refresh remote peers avatar name
        setPeerAvatarImgName(peer_id + "_avatar", peers[peer_id]["peer_name"]);
        // refresh remote peers hand icon status and title
        setPeerHandStatus(
          peer_id,
          peers[peer_id]["peer_name"],
          peers[peer_id]["peer_hand"]
        );
        // refresh remote peers video icon status and title
        setPeerVideoStatus(peer_id, peers[peer_id]["peer_video"]);
        // refresh remote peers audio icon status and title
        setPeerAudioStatus(peer_id, peers[peer_id]["peer_audio"]);
        // show status menu
        toggleClassElements("statusMenu", "inline");
      }
    };

    if (useRTCDataChannel) {
      /**
       * Secure Data Channel
       * https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
       * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel
       * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ondatachannel
       * https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/onmessage
       */
      peerConnections[peer_id].ondatachannel = (event) => {
        console.log("Datachannel event " + peer_id, event);
        event.channel.onmessage = (msg) => {
          switch (event.channel.label) {
            case "teams_chat_channel":
              let dataMessage = {};
              try {
                dataMessage = JSON.parse(msg.data);
                handleDataChannelChat(dataMessage);
              } catch (err) {
                console.log(err);
              }
              break;
            case "teams_file_sharing_channel":
              handleDataChannelFileSharing(msg.data);
              break;
          }
        };
      };

      createChatDataChannel(peer_id);
      createFileSharingDataChannel(peer_id);
      // ...
    } else {
      // show chat messages dev mode
      signalingSocket.on("onMessage", (config) => {
        console.log("Receive msg", { msg: config.msg });
        if (!isChatRoomVisible) {
          showChatRoomDraggable();
          chatRoomBtn.className = "fas fa-comment-slash";
        }
        setPeerChatAvatarImgName("left", config.name);
        appendMessage(
          config.name,
          leftChatAvatar,
          "left",
          config.msg,
          config.privateMsg
        );
      });
    }

    /**
     * peerConnections[peer_id].addStream(localMediaStream);
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack
     */
    localMediaStream.getTracks().forEach((track) => {
      peerConnections[peer_id].addTrack(track, localMediaStream);
    });

    /**
     * The offer must be created by one of the peer which the server chooses.
     * Other peers will get a session descriptioN and they will be the answerer
     * to the offerer chosen by the server.

     */
    if (config.should_create_offer) {
      console.log("Creating RTC offer to", peer_id);
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
      peerConnections[peer_id]
        .createOffer()
        .then((local_description) => {
          console.log("Local offer description is", local_description);
          // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
          peerConnections[peer_id]
            .setLocalDescription(local_description)
            .then(() => {
              signalingSocket.emit("relaySDP", {
                peer_id: peer_id,
                session_description: local_description,
              });
              console.log("Offer setLocalDescription done!");
            })
            .catch((err) => {
              console.error("[Error] offer setLocalDescription", err);
              userLog("error", "Offer setLocalDescription failed " + err);
            });
        })
        .catch((err) => {
          console.error("[Error] sending offer", err);
        });
    } // end [if offer true]
  }); // end [addPeer]

  /**
   * Exchange information about the peer's audio and video. The offerer sends
   * a description making an offer while the receiver sends an answer in return.
   */
  signalingSocket.on("sessionDescription", (config) => {
    console.log("Remote Session-description", config);

    let peer_id = config.peer_id;
    let remote_description = config.session_description;

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCSessionDescription
    let description = new RTCSessionDescription(remote_description);

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription
    peerConnections[peer_id]
      .setRemoteDescription(description)
      .then(() => {
        console.log("setRemoteDescription done!");
        if (remote_description.type == "offer") {
          console.log("Creating answer");
          // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
          peerConnections[peer_id]
            .createAnswer()
            .then((local_description) => {
              console.log("Answer description is: ", local_description);
              // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
              peerConnections[peer_id]
                .setLocalDescription(local_description)
                .then(() => {
                  signalingSocket.emit("relaySDP", {
                    peer_id: peer_id,
                    session_description: local_description,
                  });
                  console.log("Answer setLocalDescription done!");
                })
                .catch((err) => {
                  console.error("[Error] answer setLocalDescription", err);
                  userLog("error", "Answer setLocalDescription failed " + err);
                });
            })
            .catch((err) => {
              console.error("[Error] creating answer", err);
            });
        } // end [if type offer]
      })
      .catch((err) => {
        console.error("[Error] setRemoteDescription", err);
      });
  }); // end [sessionDescription]

  /**
   * The offerer will send a number of ICE Candidate blobs to the answerer so they
   * can begin trying to find the best path to one another on the net.
   */
  signalingSocket.on("iceCandidate", (config) => {
    let peer_id = config.peer_id;
    let ice_candidate = config.ice_candidate;
    // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate
    peerConnections[peer_id]
      .addIceCandidate(new RTCIceCandidate(ice_candidate))
      .catch((err) => {
        console.error("[Error] addIceCandidate", err);
      });
  });

  // refresh peers name
  signalingSocket.on("onCName", (config) => {
    appendPeerName(config.peer_id, config.peer_name);
  });

  // refresh peers video - audio - hand icon status and title
  signalingSocket.on("onpeerStatus", (config) => {
    switch (config.element) {
      case "video":
        setPeerVideoStatus(config.peer_id, config.status);
        break;
      case "audio":
        setPeerAudioStatus(config.peer_id, config.status);
        break;
      case "hand":
        setPeerHandStatus(config.peer_id, config.peer_name, config.status);
        break;
    }
  });

  // whiteboard actions
  signalingSocket.on("wb", (config) => {
    // only applicable to pc if mobile return
    if (isMobileDevice) return;
    switch (config.act) {
      case "draw":
        drawRemote(config);
        break;
      case "clean":
        userLog("toast", config.peer_name + " has cleaned the board");
        whiteboardClean();
        break;
      case "open":
        userLog("toast", config.peer_name + " has opened the board");
        whiteboardOpen();
        break;
      case "close":
        userLog("toast", config.peer_name + " has closed the board");
        whiteboardClose();
        break;
      case "resize":
        userLog("toast", config.peer_name + " has resized the board");
        whiteboardResize();
        break;
      // ...
    }
  });

  // kick out
  signalingSocket.on("onKickOut", (config) => {
    kickedOut(config.peer_name);
  });
  // get file info
  signalingSocket.on("onFileInfo", (data) => {
    startDownload(data);
  });

  /**
   * Remove media shared and peer connection when a
   * peer disconnects.
   */
  signalingSocket.on("disconnect", () => {
    console.log("Disconnected from signaling server");
    for (let peer_id in peerMediaElements) {
      document.body.removeChild(peerMediaElements[peer_id].parentNode);
      resizeVideos();
    }
    for (let peer_id in peerConnections) {
      peerConnections[peer_id].close();
      messengerRemovePeer(peer_id);
    }
    if (useRTCDataChannel) chatDataChannels = {};
    fileSharingDataChannels = {};
    peerConnections = {};
    peerMediaElements = {};
  });

  /**
   * When a peer leaves the channel, other peers in the channel will get
   * a message to trash the media created by them. If the peer disconnects abruptly
   * then signal.socket.io will kick in and remove any media channels created by the
   * peer that disconnected.
   */
  signalingSocket.on("removePeer", (config) => {
    console.log("Signaling server said to remove peer:", config);

    let peer_id = config.peer_id;

    if (peer_id in peerMediaElements) {
      document.body.removeChild(peerMediaElements[peer_id].parentNode);
      resizeVideos();
    }
    if (peer_id in peerConnections) {
      peerConnections[peer_id].close();
    }

    messengerRemovePeer(peer_id);

    if (useRTCDataChannel) delete chatDataChannels[peer_id];
    delete fileSharingDataChannels[peer_id];

    delete peerConnections[peer_id];
    delete peerMediaElements[peer_id];
  });
} // end [initPeer]

/**
 * Setting the theme
 * @param {*} theme
 */
function setTheme(theme) {
  if (!theme) return;

  microsoftTeams = theme;
  switch (microsoftTeams) {
    case "default":
      // default theme
      swalBackground = "rgba(123,131,235,0.6)";
      document.documentElement.style.setProperty("--body-bg", "white");
      document.documentElement.style.setProperty("--messenger-bg", "white");
      document.documentElement.style.setProperty(
        "--messenger-private-bg",
        "white"
      );
      document.documentElement.style.setProperty(
        "--left-message-bg",
        "#464EB8"
      );
      document.documentElement.style.setProperty("--private-msg-bg", "#7B83EB");
      document.documentElement.style.setProperty("--right-msg-bg", "#505AC9");
      document.documentElement.style.setProperty("--wb-bg", "#464EB8");
      document.documentElement.style.setProperty("--wb-hbg", "#464EB8");
      document.documentElement.style.setProperty("--btn-bg", "white");
      document.documentElement.style.setProperty("--btn-color", "#464EB8");
      document.documentElement.style.setProperty("--btn-opc", "1");
      document.documentElement.style.setProperty("--btns-left", "20px");
      document.documentElement.style.setProperty(
        "--my-settings-label-color",
        "white"
      );
      document.documentElement.style.setProperty(
        "--box-shadow",
        "3px 3px 6px #464EB8, -3px -3px 6px #7B83EB"
      );
      break;
    // ...
    default:
      console.log("No theme found");
  }
}

/**
 * Setup local media stuff
 * @param {*} callback
 * @param {*} errorback
 */
function setupLocalMedia(callback, errorback) {
  // if already initialized, do nothing
  if (localMediaStream != null) {
    if (callback) callback();
    return;
  }

  getPeerGeoLocation();

  /**
   * Asking the user for audio and video permission and attach it to a <audio> and <video>
   * if they allow.
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
   */
  console.log("Requesting access to local audio / video inputs");

  const constraints = {
    audio: useAudio,
    video: useVideo,
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      console.log("Access granted to audio/video");
      // hide img bg and loading div
      document.body.style.backgroundImage = "none";
      getId("loadObj").style.display = "none";

      localMediaStream = stream;

      const videoWrap = document.createElement("div");

      // handle my peer name video audio status
      const myStatusMenu = document.createElement("div");
      const myCountTimeImg = document.createElement("i");
      const myCountTime = document.createElement("p");
      const myVideoParagraphImg = document.createElement("i");
      const myVideoParagraph = document.createElement("h4");
      const myHandStatusIcon = document.createElement("button");
      const myVideoStatusIcon = document.createElement("button");
      const myAudioStatusIcon = document.createElement("button");
      const myVideoFullScreenBtn = document.createElement("button");
      const myVideoAvatarImage = document.createElement("img");

      // menu Status
      myStatusMenu.setAttribute("id", "myStatusMenu");
      myStatusMenu.className = "statusMenu";

      // session time
      myCountTimeImg.setAttribute("id", "countTimeImg");
      myCountTimeImg.className = "fas fa-clock";
      myCountTime.setAttribute("id", "countTime");
      tippy(myCountTime, {
        content: "Session Time",
      });
      // my peer name
      myVideoParagraphImg.setAttribute("id", "myVideoParagraphImg");
      myVideoParagraphImg.className = "fas fa-user";
      myVideoParagraph.setAttribute("id", "myVideoParagraph");
      myVideoParagraph.className = "videoPeerName";
      tippy(myVideoParagraph, {
        content: "My name",
      });
      // my hand status
      myHandStatusIcon.setAttribute("id", "myHandStatusIcon");
      myHandStatusIcon.className = "fas fa-hand-paper pulsate";
      myHandStatusIcon.style.setProperty("color", "rgb(166, 141, 214)");
      tippy(myHandStatusIcon, {
        content: "Hand RAISED",
      });
      // my video status
      myVideoStatusIcon.setAttribute("id", "myVideoStatusIcon");
      myVideoStatusIcon.className = "fas fa-video";
      tippy(myVideoStatusIcon, {
        content: "My video is ON",
      });
      // my audio status
      myAudioStatusIcon.setAttribute("id", "myAudioStatusIcon");
      myAudioStatusIcon.className = "fas fa-microphone";
      tippy(myAudioStatusIcon, {
        content: "My audio is ON",
      });
      // my video full screen mode
      myVideoFullScreenBtn.setAttribute("id", "myVideoFullScreenBtn");
      myVideoFullScreenBtn.className = "fas fa-expand";
      tippy(myVideoFullScreenBtn, {
        content: "Full screen mode",
      });
      // my video avatar image
      myVideoAvatarImage.setAttribute("id", "myVideoAvatarImage");
      myVideoAvatarImage.className = "videoAvatarImage pulsate";

      // add elements to myStatusMenu div
      myStatusMenu.appendChild(myCountTimeImg);
      myStatusMenu.appendChild(myCountTime);
      myStatusMenu.appendChild(myVideoParagraphImg);
      myStatusMenu.appendChild(myVideoParagraph);
      myStatusMenu.appendChild(myHandStatusIcon);
      myStatusMenu.appendChild(myVideoStatusIcon);
      myStatusMenu.appendChild(myAudioStatusIcon);
      myStatusMenu.appendChild(myVideoFullScreenBtn);

      // add elements to video wrap div
      videoWrap.appendChild(myStatusMenu);
      videoWrap.appendChild(myVideoAvatarImage);

      // hand display none on default menad is raised == false
      myHandStatusIcon.style.display = "none";

      const localMedia = document.createElement("video");
      videoWrap.className = "video";
      videoWrap.setAttribute("id", "myVideoWrap");
      videoWrap.appendChild(localMedia);
      localMedia.setAttribute("id", "myVideo");
      localMedia.setAttribute("playsinline", true);
      localMedia.className = "mirror";
      localMedia.autoplay = true;
      localMedia.muted = true;
      localMedia.volume = 0;
      localMedia.controls = false;
      document.body.appendChild(videoWrap);

      console.log("local-video-audio", {
        video: localMediaStream.getVideoTracks()[0].label,
        audio: localMediaStream.getAudioTracks()[0].label,
      });

      // attachMediaStream is a part of the adapter.js library
      attachMediaStream(localMedia, localMediaStream);
      resizeVideos();

      getHtmlElementsById();
      setButtonsTitle();
      manageLeftButtons();
      handleBodyOnMouseMove();
      startCountTime();

      // handle video full screen mode
      handleVideoPlayerFs("myVideo", "myVideoFullScreenBtn");

      if (callback) callback();
    })
    .catch((err) => {
      // if access to audio/video denied
      // https://blog.addpipe.com/common-getusermedia-errors/
      console.error("Access denied for audio/video", err);
      window.location.href = `/permission?roomId=${roomId}&getUserError=${err}`;
      if (errorback) errorback();
    });
} // end [setup_local_stream]

/**
 * Resize video
 */
function resizeVideos() {
  const numToString = ["", "one", "two", "three", "four", "five", "six"];
  const videos = document.querySelectorAll(".video");
  document.querySelectorAll(".video").forEach((v) => {
    v.className = "video " + numToString[videos.length];
  });
}

/**
 * Kicking out peer
 * @param {*} peer_id
 */
function handlePeerKickOutBtn(peer_id) {
  let peerKickOutBtn = getId(peer_id + "_kickOut");
  peerKickOutBtn.addEventListener("click", (e) => {
    kickOut(peer_id, peerKickOutBtn);
  });
}

/**
 * Refresh video - chat image avatar on name changes
 * https://eu.ui-avatars.com/
 *
 * @param {*} videoAvatarImageId element
 * @param {*} peerName
 */
function setPeerAvatarImgName(videoAvatarImageId, peerName) {
  let videoAvatarImageElement = getId(videoAvatarImageId);
  // default img size 64 max 512
  let avatarImgSize = isMobileDevice ? 128 : 256;
  videoAvatarImageElement.setAttribute(
    "src",
    avatarApiUrl +
      "?name=" +
      peerName +
      "&size=" +
      avatarImgSize +
      "&background=random&rounded=true"
  );
}

/**
 * Set Chat avatar image by peer name
 * @param {*} avatar left/right
 * @param {*} peerName my/friends
 */
function setPeerChatAvatarImgName(avatar, peerName) {
  let avatarImg =
    avatarApiUrl +
    "?name=" +
    peerName +
    "&size=32" +
    "&background=random&rounded=true";

  switch (avatar) {
    case "left":
      // console.log("Set Friend chat avatar image");
      leftChatAvatar = avatarImg;
      break;
    case "right":
      // console.log("Set My chat avatar image");
      rightChatAvatar = avatarImg;
      break;
  }
}

/**
 * Any click on the screen go on full screen mode (except buttons)
 * Press Esc to exit from full screen mode, or click again.
 * @param {*} videoId
 * @param {*} videoFullScreenBtnId
 */
function handleVideoPlayerFs(videoId, videoFullScreenBtnId) {
  let videoPlayer = getId(videoId);
  let videoFullScreenBtn = getId(videoFullScreenBtnId);

  // handle Chrome Firefox Opera Microsoft Edge videoPlayer ESC
  videoPlayer.addEventListener("fullscreenchange", (e) => {
    // if Controls enabled, or document on FS do nothing
    if (videoPlayer.controls || isDocumentOnFullScreen) return;
    let fullscreenElement = document.fullscreenElement;
    if (!fullscreenElement) {
      videoPlayer.style.pointerEvents = "auto";
      isVideoOnFullScreen = false;
      // console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
    }
  });

  // handle Safari videoPlayer ESC
  videoPlayer.addEventListener("webkitfullscreenchange", (e) => {
    // if Controls enabled, or document on FS do nothing
    if (videoPlayer.controls || isDocumentOnFullScreen) return;
    let webkitIsFullScreen = document.webkitIsFullScreen;
    if (!webkitIsFullScreen) {
      videoPlayer.style.pointerEvents = "auto";
      isVideoOnFullScreen = false;
      // console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
    }
  });

  // on button click go on FS
  videoFullScreenBtn.addEventListener("click", (e) => {
    handleFSVideo();
  });

  // on video click go on FS
  videoPlayer.addEventListener("click", (e) => {
    // not mobile on click go on FS or exit from FS
    if (!isMobileDevice) {
      handleFSVideo();
    } else {
      // mobile on click exit from FS, for enter use videoFullScreenBtn
      if (isVideoOnFullScreen) handleFSVideo();
    }
  });

  function handleFSVideo() {
    // if Controls enabled, or document on FS do nothing
    if (videoPlayer.controls || isDocumentOnFullScreen) return;

    if (!isVideoOnFullScreen) {
      if (videoPlayer.requestFullscreen) {
        // Chrome Firefox Opera Microsoft Edge
        videoPlayer.requestFullscreen();
      } else if (videoPlayer.webkitRequestFullscreen) {
        // Safari request full screen mode
        videoPlayer.webkitRequestFullscreen();
      } else if (videoPlayer.msRequestFullscreen) {
        // IE11 request full screen mode
        videoPlayer.msRequestFullscreen();
      }
      isVideoOnFullScreen = true;
      videoPlayer.style.pointerEvents = "none";
    } else {
      if (document.exitFullscreen) {
        // Chrome Firefox Opera Microsoft Edge
        document.exitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        // Safari exit full screen mode
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        // IE11 exit full screen mode
        document.msExitFullscreen();
      }
      isVideoOnFullScreen = false;
      videoPlayer.style.pointerEvents = "auto";
      // console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
    }
  }
}

/**
 * Start log into teams time
 */
function startCountTime() {
  countTime.style.display = "inline";
  callStartTime = Date.now();
  setInterval(function printTime() {
    callElapsedTime = Date.now() - callStartTime;
    countTime.innerHTML = getTimeToString(callElapsedTime);
  }, 1000);
}

/**
 * Return time to string time format
 * @param {*} time
 */
function getTimeToString(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);
  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);
  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);
  let formattedHH = hh.toString().padStart(2, "0");
  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  return `${formattedHH}:${formattedMM}:${formattedSS}`;
}

/**
 * WebRTC left buttons
 */
function manageLeftButtons() {
  setShareTeamBtn();
  setAudioToggleBtn();
  setVideoToggleBtn();
  setShareScreenBtn();
  setFullScreenBtn();
  setChatRoomBtn();
  setChatEmojiBtn();
  setMyHandBtn();
  setMyWhiteboardBtn();
  setMyFileShareBtn();
  setLeaveRoomBtn();
  showLeftButtonsAndMenu();
}

/**
 * Copy and share URL on click
 */
function setShareTeamBtn() {
  shareTeamBtn.addEventListener("click", async (e) => {
    // shareRoomUrl();
  });
}

/**
 * Audio mute - unmute button click
 */
function setAudioToggleBtn() {
  audioToggleBtn.addEventListener("click", (e) => {
    handleAudio(e, false);
  });
}

/**
 * Video hide - show button click
 */
function setVideoToggleBtn() {
  videoToggleBtn.addEventListener("click", (e) => {
    handleVideo(e, false);
  });
}

/**
 * If screen share possible,
 * show button else hide it
 */
function setShareScreenBtn() {
  if (
    !isMobileDevice &&
    (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia)
  ) {
    // share screen on - off button click event
    shareScreenBtn.addEventListener("click", (e) => {
      toggleScreenSharing();
    });
  } else {
    shareScreenBtn.style.display = "none";
  }
}
/**
 * Full screen button click event
 */
function setFullScreenBtn() {
  if (DetectRTC.browser.name != "Safari") {
    // detect esc from full screen mode
    document.addEventListener("fullscreenchange", (e) => {
      let fullscreenElement = document.fullscreenElement;
      if (!fullscreenElement) {
        fullScreenBtn.className = "fas fa-expand-alt";
        isDocumentOnFullScreen = false;
        // only for desktop
        if (!isMobileDevice) {
          tippy(fullScreenBtn, {
            content: "VIEW full screen",
            placement: "right-start",
          });
        }
      }
    });
    fullScreenBtn.addEventListener("click", (e) => {
      toggleFullScreen();
    });
  } else {
    fullScreenBtn.style.display = "none";
  }
}

/**
 * Chat room buttons click event
 */
function setChatRoomBtn() {
  // adapt chat room for mobile
  setChatRoomForMobile();

  // open hide chat room
  chatRoomBtn.addEventListener("click", (e) => {
    if (!isChatRoomVisible) {
      showChatRoomDraggable();
    } else {
      hideChatRoomAndEmojiPicker();
      e.target.className = "fas fa-comment";
    }
  });

  // Can't send messages if no peer detected
  messengerCPBtn.addEventListener("click", (e) => {
    if (!thereIsPeerConnections()) {
      userLog("info", "No participants detected");
      return;
    }
    messengerCP.style.display = "flex";
  });

  // hide messenger participants section
  messengerCPCloseBtn.addEventListener("click", (e) => {
    messengerCP.style.display = "none";
  });

  // clean chat messages
  messengerClean.addEventListener("click", (e) => {
    cleanMessages();
  });

  // save chat messages to file
  messengerSaveBtn.addEventListener("click", (e) => {
    if (chatMessages.length != 0) {
      downloadChatMsgs();
      return;
    }
    userLog("info", "No messages to save");
  });

  // close chat room - show left button and status menu if hide
  messengerClose.addEventListener("click", (e) => {
    hideChatRoomAndEmojiPicker();
    showLeftButtonsAndMenu();
  });

  // Execute a function when the user releases a key on the keyboard
  messengerInput.addEventListener("keyup", (e) => {
    // Number 13 is the "Enter" key on the keyboard
    if (e.keyCode === 13) {
      e.preventDefault();
      messengerSendBtn.click();
    }
  });

  // on input check for emoji from map
  messengerInput.oninput = () => {
    for (let i in chatInputEmoji) {
      let regex = new RegExp(escapeSpecialChars(i), "gim");
      this.value = this.value.replace(regex, chatInputEmoji[i]);
    }
  };

  // chat send msg
  messengerSendBtn.addEventListener("click", (e) => {
    // prevent refresh page
    e.preventDefault();

    if (!thereIsPeerConnections()) {
      userLog("info", "Can't send message, no peer connection detected");
      messengerInput.value = "";
      return;
    }

    const msg = messengerInput.value;
    // empity msg
    if (!msg) return;

    emitMsg(myPeerName, "toAll", msg, false, "");
    appendMessage(myPeerName, rightChatAvatar, "right", msg, false);
    messengerInput.value = "";
  });
}

/**
 * Emoji picker chat room button click event
 */
function setChatEmojiBtn() {
  if (isMobileDevice) {
    // mobile already have it
    messengerEmojiBtn.style.display = "none";
  } else {
    // make emoji picker draggable for desktop
    dragElement(messengerEmojiPicker, messengerEmojiHeader);

    messengerEmojiBtn.addEventListener("click", (e) => {
      // prevent refresh page
      e.preventDefault();
      hideShowEmojiPicker();
    });

    messengerCloseEmojiBtn.addEventListener("click", (e) => {
      // prevent refresh page
      e.preventDefault();
      hideShowEmojiPicker();
    });

    emojiPicker.addEventListener("emoji-click", (e) => {
      messengerInput.value += e.detail.emoji.unicode;
    });
  }
}

/**
 * Set my hand button click event
 */
function setMyHandBtn() {
  myHandBtn.addEventListener("click", async (e) => {
    setMyHandStatus();
  });
}

/**
 * Whiteboard
 * https://r8.whiteboardfox.com
 */
function setMyWhiteboardBtn() {
  // not supported for mobile devices
  if (isMobileDevice) {
    whiteboardBtn.style.display = "none";
    return;
  }

  setupCanvas();

  // open - close whiteboard
  whiteboardBtn.addEventListener("click", (e) => {
    if (isWhiteboardVisible) {
      whiteboardClose();
      remoteWbAction("close");
    } else {
      whiteboardOpen();
      remoteWbAction("open");
    }
  });
  // close whiteboard
  whiteboardCloseBtn.addEventListener("click", (e) => {
    whiteboardClose();
    remoteWbAction("close");
  });
  // view full screen
  whiteboardFsBtn.addEventListener("click", (e) => {
    whiteboardResize();
    remoteWbAction("resize");
  });
  // erase whiteboard
  whiteboardEraseBtn.addEventListener("click", (e) => {
    setEraser();
  });
  // save whitebaord content as img
  whiteboardSaveBtn.addEventListener("click", (e) => {
    saveWbCanvas();
  });
  // clean whiteboard
  whiteboardCleanBtn.addEventListener("click", (e) => {
    confirmCleanBoard();
  });
}

/**
 * File Transfer between peers
 * https://fromsmash.com for Big Data
 */
function setMyFileShareBtn() {
  fileShareBtn.addEventListener("click", (e) => {
    //window.open("https://fromsmash.com");
    selectFileToShare();
  });
  sendAbortBtn.addEventListener("click", (e) => {
    abortFileTransfer();
  });
}

/**
 * Leave room button
 */
function setLeaveRoomBtn() {
  leaveRoomBtn.addEventListener("click", (e) => {
    leaveRoom();
  });
}

/**
 * Handle left buttons - status menù show - hide on body mouse move
 */
function handleBodyOnMouseMove() {
  document.body.addEventListener("mousemove", (e) => {
    showLeftButtonsAndMenu();
  });
}
/**
 * Refresh Local media audio video in - out
 */
function refreshLocalMedia() {
  // some devices can't swap the video track, if already in execution.
  stopLocalVideoTrack();
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .then(gotDevices)
    .catch(handleError);
}

/**
 * Change Audio Output
 */
function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(myVideo, audioDestination);
}

/**
 * Attach audio output device to video element using device/sink ID.
 * @param {*} element
 * @param {*} sinkId
 */
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== "undefined") {
    element
      .setSinkId(sinkId)
      .then(() => {
        console.log(`Success, audio output device attached: ${sinkId}`);
      })
      .catch((err) => {
        let errorMessage = err;
        if (err.name === "SecurityError") {
          errorMessage = `You need to use HTTPS for selecting audio output device: ${err}`;
        }
        console.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        audioOutputSelect.selectedIndex = 0;
      });
  } else {
    console.warn("Browser does not support output device selection.");
  }
}

/**
 * Got Stream and append to local media
 * @param {*} stream
 */
function gotStream(stream) {
  refreshMyStreamToPeers(stream);
  refreshMyLocalStream(stream);
  setMyVideoStatusTrue();
  if (myVideoChange) {
    myVideo.classList.toggle("mirror");
  }
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

/**
 * Get audio-video Devices and show it to select box
 * https://github.com/webrtc/samples/tree/gh-pages/src/content/devices/input-output
 * @param {*} deviceInfos
 */
function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map((select) => select.value);
  selectors.forEach((select) => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  // check devices
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    // console.log("device-info ------> ", deviceInfo);
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;

    if (deviceInfo.kind === "audioinput") {
      // audio Input
      option.text =
        deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === "audiooutput") {
      // audio Output
      option.text =
        deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      // video Input
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      // something else
      console.log("Some other kind of source/device: ", deviceInfo);
    }
  } // end for devices

  selectors.forEach((select, selectorIndex) => {
    if (
      Array.prototype.slice
        .call(select.childNodes)
        .some((n) => n.value === values[selectorIndex])
    ) {
      select.value = values[selectorIndex];
    }
  });
}

/**
 * Handle getUserMedia error
 * @param {*} err
 */
function handleError(err) {
  console.log(
    "navigator.MediaDevices.getUserMedia error: ",
    err.message,
    err.name
  );
  userLog("error", "GetUserMedia error " + err);
  // https://blog.addpipe.com/common-getusermedia-errors/
}

/**
 * AttachMediaStream stream to element
 * @param {*} element
 * @param {*} stream
 */
function attachMediaStream(element, stream) {
  console.log("Success, media stream attached");
  element.srcObject = stream;
}

/**
 * Left mouse buttons visible only for 10 secs
 * In mobile devices or chat room open do nothing
 */
function showLeftButtonsAndMenu() {
  if (
    isButtonsVisible ||
    (isMobileDevice && isChatRoomVisible) ||
    (isMobileDevice && isMySettingsVisible)
  ) {
    return;
  }
  toggleClassElements("statusMenu", "inline");
  leftButtons.style.display = "flex";
  isButtonsVisible = true;
  setTimeout(() => {
    toggleClassElements("statusMenu", "none");
    leftButtons.style.display = "none";
    isButtonsVisible = false;
  }, 10000);
}

/**
 * Copy room url to clipboard and share it with navigator share if supported
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
 */
async function shareRoomUrl() {
  const myRoomUrl = window.location.href;

  // navigator share
  let isSupportedNavigatorShare = false;
  let errorNavigatorShare = false;
  // if supported
  if (navigator.share) {
    isSupportedNavigatorShare = true;
    try {
      // not add title and description to load metadata from url
      await navigator.share({ url: myRoomUrl });
      /* userLog("toast", "Room Shared successfully!");*/
    } catch (err) {
      errorNavigatorShare = true;
    }
  }

  // error or navigator.share not supported
  if (
    !isSupportedNavigatorShare ||
    (isSupportedNavigatorShare && errorNavigatorShare)
  ) {
    Swal.fire({
      background: swalBackground,
      position: "center",
      title: "Share the Room",
      imageAlt: "teams-share",
      imageUrl: shareUrlImg,
      html:
        `
      <br/>
      <div id="qrRoomContainer">
        <canvas id="qrRoom"></canvas>
      </div>
      <br/><br/>
      <p style="color:white;"> Share this meeting invite others to join.</p>
      <p style="color:rgb(8, 189, 89);">` +
        myRoomUrl +
        `</p>`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Copy meeting URL`,
      denyButtonText: `Email invite`,
      cancelButtonText: `Close`,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        copyRoomURL();
      } else if (result.isDenied) {
        let message = {
          email: "",
          subject: "Please join the following Teams meeting",
          body: "Click to join: " + myRoomUrl,
        };
        shareRoomByEmail(message);
      }
    });
    makeRoomQR();
  }
}

/**
 * Make Room QR
 * https://github.com/neocotic/qrious
 */
function makeRoomQR() {
  let qr = new QRious({
    element: getId("qrRoom"),
    value: window.location.href,
  });
  qr.set({
    size: 128,
  });
}

/**
 * Copy Room URL to clipboard
 */
function copyRoomURL() {
  // save Room Url to clipboard
  let roomURL = window.location.href;
  let tmpInput = document.createElement("input");
  document.body.appendChild(tmpInput);
  tmpInput.value = roomURL;
  tmpInput.select();
  // for mobile devices
  tmpInput.setSelectionRange(0, 99999);
  document.execCommand("copy");
  console.log("Copied to clipboard Join Link ", roomURL);
  document.body.removeChild(tmpInput);
  userLog("toast", "Meeting URL is copied to clipboard");
}

/**
 * Share room id by email
 * @param {*} message email | subject | body
 */
function shareRoomByEmail(message) {
  let email = message.email;
  let subject = message.subject;
  let emailBody = message.body;
  document.location =
    "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;
}

/**
 * Handle Audio ON-OFF
 */
function handleAudio(e, init) {
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks
  localMediaStream.getAudioTracks()[0].enabled =
    !localMediaStream.getAudioTracks()[0].enabled;
  myAudioStatus = localMediaStream.getAudioTracks()[0].enabled;
  e.target.className = "fas fa-microphone" + (myAudioStatus ? "" : "-slash");
  if (init) {
    audioToggleBtn.className =
      "fas fa-microphone" + (myAudioStatus ? "" : "-slash");
    if (!isMobileDevice) {
      tippy(initAudioToggleBtn, {
        content: myAudioStatus ? "Microphone OFF" : "Microphone ON",
        placement: "top",
      });
    }
  }
  setMyAudioStatus(myAudioStatus);
}

/**
 * Handle Video ON-OFF
 */
function handleVideo(e, init) {
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
  localMediaStream.getVideoTracks()[0].enabled =
    !localMediaStream.getVideoTracks()[0].enabled;
  myVideoStatus = localMediaStream.getVideoTracks()[0].enabled;
  e.target.className = "fas fa-video" + (myVideoStatus ? "" : "-slash");
  if (init) {
    videoToggleBtn.className = "fas fa-video" + (myVideoStatus ? "" : "-slash");
    if (!isMobileDevice) {
      tippy(initVideoToggleBtn, {
        content: myVideoStatus ? "Click to video OFF" : "Click to video ON",
        placement: "top",
      });
    }
  }
  setMyVideoStatus(myVideoStatus);
}

/**
 * SwapCamera front (user) - rear (environment)
 */
function swapCamera() {
  // setup camera
  camera = camera == "user" ? "environment" : "user";
  if (camera == "user") useVideo = true;
  else useVideo = { facingMode: { exact: camera } };

  // some devices can't swap the cam, if have Video Track already in execution.
  if (useVideo) stopLocalVideoTrack();

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  navigator.mediaDevices
    .getUserMedia({ video: useVideo })
    .then((camStream) => {
      refreshMyStreamToPeers(camStream);
      refreshMyLocalStream(camStream);
      if (useVideo) {
        setMyVideoStatusTrue();
        localMediaStream.getVideoTracks()[0].enabled = true;
      }
      myVideo.classList.toggle("mirror");
    })
    .catch((err) => {
      console.log("[Error] to swaping camera", err);
      userLog("error", "Error to swaping the camera " + err);
      // https://blog.addpipe.com/common-getusermedia-errors/
    });
}

/**
 * Stop Local Video Track
 */
function stopLocalVideoTrack() {
  localMediaStream.getVideoTracks()[0].stop();
}
audioInputSelect.addEventListener("change", (e) => {
  myVideoChange = false;
  /*refreshLocalMedia();*/
});
videoSelect.addEventListener("change", (e) => {
  myVideoChange = true;
  /*refreshLocalMedia();*/
});
/**
 * Get audio - video constraints
 * @returns constraints
 */
function getAudioVideoConstraints() {
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  let videoConstraints = getVideoConstraints(
    videoQualitySelect.value ? videoQualitySelect.value : "default"
  );
  videoConstraints["deviceId"] = videoSource
    ? { exact: videoSource }
    : undefined;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: videoConstraints,
  };
  return constraints;
}

function stopCapture() {
  let tracks = screenMediaPromise.getTracks();

  tracks.forEach((track) => track.stop());
  screenMediaPromise = null;
}

/**
 * ON-OFF screen sharing
 */
function toggleScreenSharing() {
  const constraints = {
    video: true,
  };

  let screenMediaPromise;

  if (!isScreenStreaming) {
    // on screen sharing start
    if (navigator.getDisplayMedia) {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
      screenMediaPromise = navigator.getDisplayMedia(constraints);
    } else if (navigator.mediaDevices.getDisplayMedia) {
      screenMediaPromise = navigator.mediaDevices.getDisplayMedia(constraints);
    } else {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      screenMediaPromise = navigator.mediaDevices.getUserMedia({
        video: {
          mediaSource: "screen",
        },
      });
    }
  } else {
    // on screen sharing stop
    screenMediaPromise = navigator.mediaDevices.getUserMedia(
      getAudioVideoConstraints()
    );
    // if screen sharing accidentally closed
    if (isStreamRecording) {
      stopStreamRecording();
    }
  }
  screenMediaPromise
    .then((screenStream) => {
      // stop cam video track on screen share
      stopLocalVideoTrack();
      isScreenStreaming = !isScreenStreaming;
      refreshMyStreamToPeers(screenStream);
      refreshMyLocalStream(screenStream);
      myVideo.classList.toggle("mirror");
      setScreenSharingStatus(isScreenStreaming);
      //setMyVideoStatusTrue();
    })
    .catch((err) => {
      console.error("[Error] Unable to share the screen", err);
      userLog("error", "Unable to share the screen " + err);
    });
}

/**
 * Set Screen Sharing Status
 * @param {*} status
 */
function setScreenSharingStatus(status) {
  shareScreenBtn.className = status ? "fas fa-stop-circle" : "fas fa-desktop";
  // only for desktop
  if (!isMobileDevice) {
    tippy(shareScreenBtn, {
      content: status ? "STOP sharing" : "START screen sharing",
      placement: "right-start",
    });
  }
}

/**
 * set myVideoStatus
 */
function setMyVideoStatusTrue() {
  // Put video status On by default
  if (myVideoStatus === false) {
    myVideoStatus = true;
    videoToggleBtn.className = "fas fa-video";
    myVideoStatusIcon.className = "fas fa-video";
    myVideoAvatarImage.style.display = "none";
    emitPeerStatus("video", myVideoStatus);
    // only for desktop
    if (!isMobileDevice) {
      tippy(videoToggleBtn, {
        content: "Click to video OFF",
        placement: "right-start",
      });
    }
  }
}

/**
 * Enter - esc on full screen mode
 * https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 */
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullScreenBtn.className = "fas fa-compress-alt";
    isDocumentOnFullScreen = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      fullScreenBtn.className = "fas fa-expand-alt";
      isDocumentOnFullScreen = false;
    }
  }
  // only for desktop
  if (!isMobileDevice) {
    tippy(fullScreenBtn, {
      content: isDocumentOnFullScreen ? "EXIT full screen" : "VIEW full screen",
      placement: "right-start",
    });
  }
}

/**
 * Refresh my stream changes to connected peers in the room
 * @param {*} stream
 */
function refreshMyStreamToPeers(stream) {
  if (thereIsPeerConnections()) {
    // refresh my video stream
    for (let peer_id in peerConnections) {
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getSenders
      let sender = peerConnections[peer_id]
        .getSenders()
        .find((s) => (s.track ? s.track.kind === "video" : false));
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack
      sender.replaceTrack(stream.getVideoTracks()[0]);
    }
  }
}

/**
 * Refresh my local stream
 * @param {*} stream
 */
function refreshMyLocalStream(stream) {
  stream.getVideoTracks()[0].enabled = true;
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
  const newStream = new MediaStream([
    stream.getVideoTracks()[0],
    localMediaStream.getAudioTracks()[0],
  ]);
  localMediaStream = newStream;

  // attachMediaStream is a part of the adapter.js library
  attachMediaStream(myVideo, localMediaStream); // newstream

  // video stops on toggling screen sharing
  stream.getVideoTracks()[0].onended = () => {
    if (isScreenStreaming) toggleScreenSharing();
  };

  /** when screen sharing is stopped, on default it turns back to the webcam with video stream ON.
   *  if you want the webcam with video stream OFF, just disable it with the button (click to video OFF),
   *  before stopping the screen sharing.
   */
  if (myVideoStatus === false) {
    localMediaStream.getVideoTracks()[0].enabled = false;
  }
}

/**
 * recordind stream data
 * @param {*} event
 */
function handleDataAvailable(event) {
  console.log("handleDataAvailable", event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

/**
 * Data Formated DD-MM-YYYY-H_M_S
 * https://convertio.co/it/
 * @returns data string
 */
function getDataTimeString() {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date}-${time}`;
}

/**
 * Set the chat room on full screen mode for mobile
 */
function setChatRoomForMobile() {
  if (isMobileDevice) {
    document.documentElement.style.setProperty("--messenger-height", "99%");
    document.documentElement.style.setProperty("--messenger-width", "99%");
  } else {
    // make chat room draggable for desktop
    dragElement(messengerDrag, messengerHeader);
  }
}

/**
 * Show messenger draggable on center screen position
 */
function showChatRoomDraggable() {
  if (isMobileDevice) {
    leftButtons.style.display = "none";
    isButtonsVisible = false;
  }
  chatRoomBtn.className = "fas fa-comment-slash";
  messengerDrag.style.top = "50%";
  messengerDrag.style.left = "50%";
  messengerDrag.style.display = "flex";
  isChatRoomVisible = true;
  // only for desktop
  if (!isMobileDevice) {
    tippy(chatRoomBtn, {
      content: "CLOSE the chat",
      placement: "left-start",
    });
  }
}

/**
 * Clean chat messages
 * https://sweetalert2.github.io
 */
function cleanMessages() {
  // clean chat messages
  let msgs = messengerChat.firstChild;
  while (msgs) {
    messengerChat.removeChild(msgs);
    msgs = messengerChat.firstChild;
  }
  // clean object
  chatMessages = [];
}

/**
 * Hide chat room and emoji picker
 */
function hideChatRoomAndEmojiPicker() {
  messengerDrag.style.display = "none";
  messengerEmojiPicker.style.display = "none";
  chatRoomBtn.className = "fas fa-comment";
  isChatRoomVisible = false;
  isChatEmojiVisible = false;
  // only for desktop
  if (!isMobileDevice) {
    tippy(chatRoomBtn, {
      content: "OPEN the chat",
      placement: "right-start",
    });
  }
}

/**
 * Create Chat Room Data Channel
 * @param {*} peer_id
 */
function createChatDataChannel(peer_id) {
  chatDataChannels[peer_id] =
    peerConnections[peer_id].createDataChannel("teams_chat_channel");
}

/**
 * handle Incoming Data Channel Chat Messages
 * @param {*} dataMessages
 */
function handleDataChannelChat(dataMessages) {
  switch (dataMessages.type) {
    case "chat":
      // private message but not for me return
      if (dataMessages.privateMsg && dataMessages.toName != myPeerName) return;
      // log incoming dataMessages json
      console.log("handleDataChannelChat", dataMessages);
      // chat message for me also
      if (!isChatRoomVisible) {
        showChatRoomDraggable();
        chatRoomBtn.className = "fas fa-comment-slash";
      }
      setPeerChatAvatarImgName("left", dataMessages.name);
      appendMessage(
        dataMessages.name,
        leftChatAvatar,
        "left",
        dataMessages.msg,
        dataMessages.privateMsg
      );
      break;
    // .........
    default:
      break;
  }
}

/**
 * Escape Special Chars
 * @param {*} regex
 */
function escapeSpecialChars(regex) {
  return regex.replace(/([()[{*+.$^\\|?])/g, "\\$1");
}

/**
 * Append Message to messenger chat room
 * @param {*} name
 * @param {*} img
 * @param {*} side
 * @param {*} text
 * @param {*} privateMsg
 */
function appendMessage(name, img, side, text, privateMsg) {
  let time = getFormatDate(new Date());
  // collect chat messages for download later
  chatMessages.push({
    time: time,
    name: name,
    text: text,
    private_msg: privateMsg,
  });

  // check if i receive a private message
  let msgBubble = privateMsg ? "priv-msg-box" : "msg-bubble";

  // console.log("chatMessages", chatMessages);
  let ctext = detectUrl(text);
  const msgHTML = `
	<div class="msg ${side}-msg">
		<div class="msg-img" style="background-image: url('${img}')"></div>
		<div class=${msgBubble}>
      <div class="msg-info">
        <div class="msg-info-name">${name}</div>
        <div class="msg-info-time">${time}</div>
      </div>
      <div class="msg-text">${ctext}</div>
    </div>
	</div>
  `;
  messengerChat.insertAdjacentHTML("beforeend", msgHTML);
  messengerChat.scrollTop += 500;
}

/**
 * Add participants in the chat room lists
 * @param {*} peers
 */
function messengerAddPeers(peers) {
  // console.log("peers", peers);
  // add all current Participants
  for (let peer_id in peers) {
    let peer_name = peers[peer_id]["peer_name"];
    // bypass insert to myself in the list :)
    if (peer_name != myPeerName) {
      let existMessengerPrivateDiv = getId(peer_id + "_pMsgDiv");
      // if there isn't add it....
      if (!existMessengerPrivateDiv) {
        let messengerPrivateDiv = `
        <div id="${peer_id}_pMsgDiv" class="messenger-inputarea">
          <input
            id="${peer_id}_pMsgInput"
            class="messenger-input"
            type="text"
            placeholder="Enter your message..."
          />
          <button id="${peer_id}_pMsgBtn" class="fas fa-paper-plane" value="${peer_name}">&nbsp;${peer_name}</button>
        </div>
        `;
        messengerCPList.insertAdjacentHTML("beforeend", messengerPrivateDiv);
        messengerCPList.scrollTop += 500;

        let messengerPrivateMsgInput = getId(peer_id + "_pMsgInput");
        let messengerPrivateBtn = getId(peer_id + "_pMsgBtn");
        addMessengerPrivateBtn(
          messengerPrivateBtn,
          messengerPrivateMsgInput,
          peer_id
        );
      }
    }
  }
}

/**
 * Remove participant from chat room lists
 * @param {*} peer_id
 */
function messengerRemovePeer(peer_id) {
  let messengerPrivateDiv = getId(peer_id + "_pMsgDiv");
  if (messengerPrivateDiv) {
    let peerToRemove = messengerPrivateDiv.firstChild;
    while (peerToRemove) {
      messengerPrivateDiv.removeChild(peerToRemove);
      peerToRemove = messengerPrivateDiv.firstChild;
    }
    messengerPrivateDiv.remove();
  }
}

/**
 * Setup messenger buttons to send private messages
 * @param {*} messengerPrivateBtn
 * @param {*} messengerPrivateMsgInput
 * @param {*} peer_id
 */
function addMessengerPrivateBtn(
  messengerPrivateBtn,
  messengerPrivateMsgInput,
  peer_id
) {
  // add button to send private messages
  messengerPrivateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let pMsg = messengerPrivateMsgInput.value;
    if (!pMsg) return;
    let toPeerName = messengerPrivateBtn.value;
    // userLog("info", toPeerName + ":" + peer_id);
    emitMsg(myPeerName, toPeerName, pMsg, true, peer_id);
    appendMessage(
      myPeerName,
      rightChatAvatar,
      "right",
      pMsg + "<br/><hr>Private message to " + toPeerName,
      true
    );
    messengerPrivateMsgInput.value = "";
    messengerCP.style.display = "none";
  });
}

/**
 * Detect url from chat text and make it clickable
 * Detect img from URL and create preview
 * @param {*} text
 * @returns html
 */
function detectUrl(text) {
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    if (isImageURL(text)) {
      return (
        '<p><img src="' + url + '" alt="img" width="200" height="auto"/></p>'
      );
    }
    return (
      '<a id="chat-msg-a" href="' + url + '" target="_blank">' + url + "</a>"
    );
  });
}

/**
 * Check if url passed is a image
 * @param {*} url
 * @returns true/false
 */
function isImageURL(url) {
  return url.match(/\.(jpeg|jpg|gif|png|tiff|bmp)$/) != null;
}

/**
 * Format data h:m:s
 * @param {*} date
 */
function getFormatDate(date) {
  const time = date.toTimeString().split(" ")[0];
  return `${time}`;
}

/**
 * Send message over Secure dataChannels if use useRTCDataChannel(true)
 * otherwise over signaling server
 * @param {*} name
 * @param {*} toName
 * @param {*} msg
 * @param {*} privateMsg private message true/false
 * @param {*} peer_id to sent private message
 */
function emitMsg(name, toName, msg, privateMsg, peer_id) {
  if (msg) {
    if (useRTCDataChannel) {
      const chatMessage = {
        type: "chat",
        name: name,
        toName: toName,
        msg: msg,
        privateMsg: privateMsg,
      };
      // peer to peer over DataChannels
      Object.keys(chatDataChannels).map((peerId) =>
        chatDataChannels[peerId].send(JSON.stringify(chatMessage))
      );
    } else {
      // client over signaling server
      signalingSocket.emit("msg", {
        peerConnections: peerConnections,
        room_id: roomId,
        privateMsg: privateMsg,
        peer_id: peer_id,
        name: name,
        msg: msg,
      });
    }
    console.log("Send msg", {
      room_id: roomId,
      privateMsg: privateMsg,
      peer_id: peer_id,
      name: name,
      msg: msg,
    });
  }
}

/**
 * Hide - Show emoji picker div
 */
function hideShowEmojiPicker() {
  if (!isChatEmojiVisible) {
    /*playSound("newMessage");*/
    messengerEmojiPicker.style.display = "block";
    isChatEmojiVisible = true;
    return;
  }
  messengerEmojiPicker.style.display = "none";
  isChatEmojiVisible = false;
}

/**
 * Download Chat messages in json format
 * https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 */
function downloadChatMsgs() {
  let a = document.createElement("a");
  a.href =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(chatMessages, null, 1));
  a.download = getDataTimeString() + "-CHAT.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Make chat room draggable
 * https://www.w3schools.com/howto/howto_js_draggable.asp
 */
function dragElement(elmnt, dragObj) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (dragObj) {
    // if present, the header is where you move the DIV from:
    dragObj.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }
  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * Send my Video-Audio-Hand... status
 * @param {*} element
 * @param {*} status
 */
function emitPeerStatus(element, status) {
  signalingSocket.emit("peerStatus", {
    peerConnections: peerConnections,
    room_id: roomId,
    peer_name: myPeerName,
    element: element,
    status: status,
  });
}

/**
 * Set my Hand Status and Icon
 */
function setMyHandStatus() {
  if (myHandStatus) {
    // Raise hand
    myHandStatus = false;
    if (!isMobileDevice) {
      tippy(myHandBtn, {
        content: "RAISE hand",
        placement: "right-start",
      });
    }
  } else {
    // Lower hand
    myHandStatus = true;
    if (!isMobileDevice) {
      tippy(myHandBtn, {
        content: "LOWER hand",
        placement: "right-start",
      });
    }
  }
  myHandStatusIcon.style.display = myHandStatus ? "inline" : "none";
  emitPeerStatus("hand", myHandStatus);
}

/**
 * Set My Audio Status Icon and Title
 */
function setMyAudioStatus(status) {
  myAudioStatusIcon.className = "fas fa-microphone" + (status ? "" : "-slash");
  // send my audio status to all peers in the room
  emitPeerStatus("audio", status);
  tippy(myAudioStatusIcon, {
    content: status ? "My audio is ON" : "My audio is OFF",
  });
  // only for desktop
  if (!isMobileDevice) {
    tippy(audioToggleBtn, {
      content: status ? "Click to audio OFF" : "Click to audio ON",
      placement: "right-start",
    });
  }
}

/**
 * Set My Video Status Icon and Title
 * https://atomiks.github.io/tippyjs/
 * @param {*} status
 */
function setMyVideoStatus(status) {
  // on vdeo OFF display my video avatar name
  myVideoAvatarImage.style.display = status ? "none" : "block";
  myVideoStatusIcon.className = "fas fa-video" + (status ? "" : "-slash");
  // send my video status to all peers in the room
  emitPeerStatus("video", status);
  tippy(myVideoStatusIcon, {
    content: status ? "My video is ON" : "My video is OFF",
  });
  // only for desktop
  if (!isMobileDevice) {
    tippy(videoToggleBtn, {
      content: status ? "Click to video OFF" : "Click to video ON",
      placement: "right-start",
    });
  }
}

/**
 * Set Participant Hand Status Icon and Title
 * @param {*} peer_id
 * @param {*} peer_name
 * @param {*} status
 */
function setPeerHandStatus(peer_id, peer_name, status) {
  let peerHandStatus = getId(peer_id + "_handStatus");
  peerHandStatus.style.display = status ? "block" : "none";
  if (status) {
    userLog("toast", peer_name + " has raised hand");
    /* playSound("rHand"); */
  }
}

/**
 * Set Participant Audio Status Icon and Title
 * https://atomiks.github.io/tippyjs/
 * @param {*} peer_id
 * @param {*} status
 */
function setPeerAudioStatus(peer_id, status) {
  let peerAudioStatus = getId(peer_id + "_audioStatus");
  peerAudioStatus.className = "fas fa-microphone" + (status ? "" : "-slash");
  tippy(peerAudioStatus, {
    content: status ? "Participant audio is ON" : "Participant audio is OFF",
  });
}

/**
 * Set Participant Video Status Icon and Title
 * https://atomiks.github.io/tippyjs/
 * @param {*} peer_id
 * @param {*} status
 */
function setPeerVideoStatus(peer_id, status) {
  let peerVideoAvatarImage = getId(peer_id + "_avatar");
  let peerVideoStatus = getId(peer_id + "_videoStatus");
  peerVideoStatus.className = "fas fa-video" + (status ? "" : "-slash");
  peerVideoAvatarImage.style.display = status ? "none" : "block";
  tippy(peerVideoStatus, {
    content: status ? "Participant video is ON" : "Participant video is OFF",
  });
}

/**
 * Whiteboard draggable
 */
function setWhiteboardDraggable() {
  dragElement(whiteboardCont, whiteboardHeader);
}

/**
 * Whiteboard Open
 */
function whiteboardOpen() {
  if (!isWhiteboardVisible) {
    setWhiteboardDraggable();
    setColor("#ffffff"); // color picker
    whiteboardCont.style.top = "50%";
    whiteboardCont.style.left = "50%";
    whiteboardCont.style.display = "block";
    isWhiteboardVisible = true;
    drawsize = 3;
    fitToContainer(canvas);
    tippy(whiteboardBtn, {
      content: "CLOSE the whiteboard",
      placement: "right-start",
    });
  }
}

/**
 * Whiteboard close
 */
function whiteboardClose() {
  if (isWhiteboardVisible) {
    whiteboardCont.style.display = "none";
    isWhiteboardVisible = false;
    tippy(whiteboardBtn, {
      content: "OPEN the whiteboard",
      placement: "right-start",
    });
  }
}

/**
 * Whiteboard resize
 */
function whiteboardResize() {
  let content;
  whiteboardCont.style.top = "50%";
  whiteboardCont.style.left = "50%";
  if (isWhiteboardFs) {
    document.documentElement.style.setProperty("--wb-width", "800px");
    document.documentElement.style.setProperty("--wb-height", "600px");
    fitToContainer(canvas);
    whiteboardFsBtn.className = "fas fa-expand-alt";
    content = "VIEW full screen";
    isWhiteboardFs = false;
  } else {
    document.documentElement.style.setProperty("--wb-width", "99%");
    document.documentElement.style.setProperty("--wb-height", "99%");
    fitToContainer(canvas);
    whiteboardFsBtn.className = "fas fa-compress-alt";
    content = "EXIT full screen";
    isWhiteboardFs = true;
  }
  tippy(whiteboardFsBtn, {
    content: content,
    placement: "bottom",
  });
}

/**
 * Whiteboard clean
 */
function whiteboardClean() {
  if (isWhiteboardVisible) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Set whiteboard color
 * @param {*} newcolor
 */
function setColor(newcolor) {
  color = newcolor;
  drawsize = 3;
  whiteboardColorPicker.value = color;
}

/**
 * Whiteboard eraser
 */
function setEraser() {
  color = "#ffffff";
  drawsize = 25;
  whiteboardColorPicker.value = color;
}

/**
 * Clean whiteboard content
 */
function confirmCleanBoard() {
  whiteboardClean();
  remoteWbAction("clean");
}

/**
 * Draw on whiteboard
 * @param {*} newx
 * @param {*} newy
 * @param {*} oldx
 * @param {*} oldy
 */
function draw(newx, newy, oldx, oldy) {
  ctx.strokeStyle = color;
  ctx.lineWidth = drawsize;
  ctx.beginPath();
  ctx.moveTo(oldx, oldy);
  ctx.lineTo(newx, newy);
  ctx.stroke();
  ctx.closePath();
}

/**
 * Draw Remote whiteboard
 * @param {*} config draw coordinates, color and size
 */
function drawRemote(config) {
  // draw on whiteboard
  if (isWhiteboardVisible) {
    ctx.strokeStyle = config.color;
    ctx.lineWidth = config.size;
    ctx.beginPath();
    ctx.moveTo(config.prevx, config.prevy);
    ctx.lineTo(config.newx, config.newy);
    ctx.stroke();
    ctx.closePath();
  }
}

/**
 * Resize canvas
 * @param {*} canvas
 */
function fitToContainer(canvas) {
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

/**
 * Handle whiteboard on windows resize
 */
function reportWindowSize() {
  fitToContainer(canvas);
}
/**
 * Whiteboard setup
 */
function setupCanvas() {
  fitToContainer(canvas);

  canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = 1;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      draw(e.offsetX, e.offsetY, x, y);
      // other peers can draw at the same time
      if (thereIsPeerConnections()) {
        signalingSocket.emit("wb", {
          peerConnections: peerConnections,
          act: "draw",
          newx: e.offsetX,
          newy: e.offsetY,
          prevx: x,
          prevy: y,
          color: color,
          size: drawsize,
        });
      }
      x = e.offsetX;
      y = e.offsetY;
    }
  });
  window.addEventListener("mouseup", (e) => {
    if (isDrawing) {
      isDrawing = 0;
    }
  });

  window.onresize = reportWindowSize;
}

/**
 * Save whiteboard canvas to file as png
 */
function saveWbCanvas() {
  // Improve it if erase something...
  let link = document.createElement("a");
  link.download = getDataTimeString() + "WHITEBOARD.png";
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
}

/**
 * Remote whiteboard actions
 * @param {*} action
 */
function remoteWbAction(action) {
  if (thereIsPeerConnections()) {
    signalingSocket.emit("wb", {
      peerConnections: peerConnections,
      peer_name: myPeerName,
      act: action,
    });
  }
}

/**
 * FILE TRANSFER
 * https://webrtc.github.io/samples/src/content/datachannel/filetransfer/
 * https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/filetransfer/js/main.js
 */

/**
 * Create File Sharing Data Channel
 * @param {*} peer_id
 */
function createFileSharingDataChannel(peer_id) {
  fileSharingDataChannels[peer_id] = peerConnections[peer_id].createDataChannel(
    "teams_file_sharing_channel"
  );
  fileSharingDataChannels[peer_id].binaryType = "arraybuffer";
  fileSharingDataChannels[peer_id].addEventListener(
    "open",
    onFSChannelStateChange
  );
  fileSharingDataChannels[peer_id].addEventListener(
    "close",
    onFSChannelStateChange
  );
  fileSharingDataChannels[peer_id].addEventListener("error", onFsError);
}

/**
 * Handle File Sharing
 * @param {*} data
 */
function handleDataChannelFileSharing(data) {
  receiveBuffer.push(data);
  receivedSize += data.byteLength;

  // let getPercentage = ((receivedSize / incomingFileInfo.fileSize) * 100).toFixed(2);
  // console.log("Received progress: " + getPercentage + "%");

  if (receivedSize === incomingFileInfo.fileSize) {
    incomingFileData = receiveBuffer;
    receiveBuffer = [];
    endDownload();
  }
}

/**
 * Handle File Sharing data channel state
 * @param {*} event
 */
function onFSChannelStateChange(event) {
  console.log("onFSChannelStateChange", event.type);
  if (event.type === "close") {
    if (sendInProgress) {
      userLog("error", "File Sharing channel closed");
      shareFileDiv.style.display = "none";
      sendInProgress = false;
    }
    fsDataChannelOpen = false;
    return;
  }
  fsDataChannelOpen = true;
}

/**
 * Handle File sharing data channel error
 * @param {*} event
 */
function onFsError(event) {
  // cleanup
  receiveBuffer = [];
  incomingFileData = [];
  receivedSize = 0;
  shareFileDiv.style.display = "none";
  // Popup what wrong
  if (sendInProgress) {
    console.error("onFsError", event);
    userLog("error", "File Sharing " + event.error);
    sendInProgress = false;
  }
}

/**
 * Send File Data through datachannel
 */
function sendFileData() {
  console.log(
    "Send file " +
      fileToSend.name +
      " size " +
      bytesToSize(fileToSend.size) +
      " type " +
      fileToSend.type
  );

  sendInProgress = true;

  shareFileInfo.innerHTML =
    "File name: " +
    fileToSend.name +
    "<br>" +
    "File type: " +
    fileToSend.type +
    "<br>" +
    "File size: " +
    bytesToSize(fileToSend.size) +
    "<br>";

  shareFileDiv.style.display = "inline";
  progressReport.max = fileToSend.size;
  fileReader = new FileReader();
  let offset = 0;

  fileReader.addEventListener("error", (err) =>
    console.error("fileReader error", err)
  );
  fileReader.addEventListener("abort", (e) =>
    console.log("fileReader aborted", e)
  );
  fileReader.addEventListener("load", (e) => {
    if (!sendInProgress || !fsDataChannelOpen) return;

    // peer to peer over DataChannels
    sendFSData(e.target.result);
    offset += e.target.result.byteLength;

    progressReport.value = offset;
    shareFilePercent.innerHTML =
      "Send progress: " + ((offset / fileToSend.size) * 100).toFixed(2) + "%";

    // send file completed
    if (offset === fileToSend.size) {
      sendInProgress = false;
      shareFileDiv.style.display = "none";
      userLog(
        "success",
        "The file " + fileToSend.name + " was sent successfully."
      );
    }

    if (offset < fileToSend.size) {
      readSlice(offset);
    }
  });
  const readSlice = (o) => {
    const slice = fileToSend.slice(offset, o + chunkSize);
    fileReader.readAsArrayBuffer(slice);
  };
  readSlice(0);
}

/**
 * Send Data if channel open
 * @param {*} data fileReader e.target.result
 */
function sendFSData(data) {
  for (let peer_id in fileSharingDataChannels) {
    if (fileSharingDataChannels[peer_id].readyState === "open") {
      fileSharingDataChannels[peer_id].send(data);
    }
  }
}

/**
 * Abort the file transfer
 */
function abortFileTransfer() {
  if (fileReader && fileReader.readyState === 1) {
    fileReader.abort();
    shareFileDiv.style.display = "none";
  }
}

/**
 * Select the File to Share
 */
function selectFileToShare() {
  Swal.fire({
    allowOutsideClick: false,
    background: swalBackground,
    imageAlt: "teams-file-sharing",
    imageUrl: fileSharingImg,
    position: "center",
    title: "Share the file",
    input: "file",
    inputAttributes: {
      accept: fileSharingInput,
      "aria-label": "Select the file",
    },
    showDenyButton: true,
    confirmButtonText: `Send`,
    denyButtonText: `Cancel`,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      fileToSend = result.value;
      if (fileToSend && fileToSend.size > 0) {
        // no particiants in the room
        if (!thereIsPeerConnections()) {
          userLog("info", "No participants detected");
          return;
        }
        // if the channel doesn't open
        if (!fsDataChannelOpen) {
          userLog(
            "error",
            "Unable to Sharing the file, DataChannel seems closed."
          );
          return;
        }
        // send some metadata about our file to peers in the room
        signalingSocket.emit("fileInfo", {
          peerConnections: peerConnections,
          peer_name: myPeerName,
          room_id: roomId,
          file: {
            fileName: fileToSend.name,
            fileSize: fileToSend.size,
            fileType: fileToSend.type,
          },
        });
        // send the File
        setTimeout(() => {
          sendFileData();
        }, 1000);
      } else {
        userLog("error", "File not selected or empty.");
      }
    }
  });
}

/**
 * Download the File
 * @param {*} data file
 */
function startDownload(data) {
  incomingFileInfo = data;
  incomingFileData = [];
  receiveBuffer = [];
  receivedSize = 0;
  let fileToReceiveInfo =
    "incoming file: " +
    incomingFileInfo.fileName +
    " size: " +
    bytesToSize(incomingFileInfo.fileSize) +
    " type: " +
    incomingFileInfo.fileType;
  console.log(fileToReceiveInfo);
  userLog("toast", fileToReceiveInfo);
}

/**
 * The file first gets saved in the blob and then a confirmational pop up
 * comes if you want to save in your PC
 * https://developer.mozilla.org/en-US/docs/Web/API/Blob
 */
function endDownload() {
  // save received file into Blob
  const blob = new Blob(incomingFileData);
  incomingFileData = [];

  // if file is image, show the preview
  if (isImageURL(incomingFileInfo.fileName)) {
    const reader = new FileReader();
    reader.onload = (e) => {
      Swal.fire({
        allowOutsideClick: false,
        background: swalBackground,
        position: "center",
        title: "Received file",
        text:
          incomingFileInfo.fileName +
          " size " +
          bytesToSize(incomingFileInfo.fileSize),
        imageUrl: e.target.result,
        imageAlt: "Teams-file-img-download",
        showDenyButton: true,
        confirmButtonText: `Save`,
        denyButtonText: `Cancel`,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          saveFileFromBlob();
        }
      });
    };
    // blob where is stored downloaded file
    reader.readAsDataURL(blob);
  } else {
    // not img file
    Swal.fire({
      allowOutsideClick: false,
      background: swalBackground,
      imageAlt: "teams-file-download",
      imageUrl: fileSharingImg,
      position: "center",
      title: "Received file",
      text:
        incomingFileInfo.fileName +
        " size " +
        bytesToSize(incomingFileInfo.fileSize),
      showDenyButton: true,
      confirmButtonText: `Save`,
      denyButtonText: `Cancel`,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        saveFileFromBlob();
      }
    });
  }

  // save to PC / Mobile devices
  function saveFileFromBlob() {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = incomingFileInfo.fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}

/**
 * Convert bytes to KB-MB-GB-TB
 * @param {*} bytes
 * @returns size
 */
function bytesToSize(bytes) {
  let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

/**
 * Kick out a peer
 * @param {*} peer_id
 * @param {*} peerKickOutBtn
 */
function kickOut(peer_id, peerKickOutBtn) {
  let pName = getId(peer_id + "_name").innerHTML;

  Swal.fire({
    background: swalBackground,
    position: "center",
    imageUrl: confirmImg,
    title: "Kick out " + pName,
    text: "Are you sure you want to kick out this participant?",
    showDenyButton: true,
    confirmButtonText: `Yes`,
    denyButtonText: `No`,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // send peer to kick out from room
      signalingSocket.emit("kickOut", {
        room_id: roomId,
        peer_id: peer_id,
        peer_name: myPeerName,
      });
      peerKickOutBtn.style.display = "none";
    }
  });
}

/**
 * Peer kick out confirmation
 * @param {*} peer_name
 */
function kickedOut(peer_name) {
  let timerInterval;

  Swal.fire({
    allowOutsideClick: false,
    background: swalBackground,
    position: "center",
    icon: "warning",
    title: "You will be kicked out from the Team!",
    html:
      `<h2 style="color: red;">` +
      peer_name +
      `</h2> will kick out you after <b style="color: red;"></b> milliseconds.`,
    timer: 10000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      timerInterval = setInterval(() => {
        const content = Swal.getHtmlContainer();
        if (content) {
          const b = content.querySelector("b");
          if (b) {
            b.textContent = Swal.getTimerLeft();
          }
        }
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  }).then(() => {
    window.location.href = "/newcall";
  });
}

/**
 * Leave the Room and create a new one
 * https://sweetalert2.github.io
 */
function leaveRoom() {
  Swal.fire({
    background: swalBackground,
    position: "center",
    imageAlt: "teams-leave",
    imageUrl: leaveRoomImg,
    title: "Leave this team?",
    showDenyButton: true,
    confirmButtonText: `Yes`,
    denyButtonText: `No`,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/newcall";
    }
  });
}

/**
 * Basic user logging
 * https://sweetalert2.github.io
 * @param {*} type
 * @param {*} message
 */
function userLog(type, message) {
  switch (type) {
    case "error":
      Swal.fire({
        background: swalBackground,
        position: "center",
        icon: "error",
        title: "Oops...",
        text: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      break;
    case "info":
      Swal.fire({
        background: swalBackground,
        position: "center",
        icon: "info",
        title: "Info",
        text: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      break;
    case "success":
      Swal.fire({
        background: swalBackground,
        position: "center",
        icon: "success",
        title: "Success",
        text: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      break;
    case "success-html":
      Swal.fire({
        background: swalBackground,
        position: "center",
        icon: "success",
        title: "Success",
        html: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      break;
    case "toast":
      const Toast = Swal.mixin({
        background: swalBackground,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      Toast.fire({
        icon: "info",
        title: message,
      });
      break;
    // ......
    default:
      alert(message);
  }
}

/**
 * Show-Hide all elements grp by class name
 * @param {*} className
 * @param {*} displayState
 */
function toggleClassElements(className, displayState) {
  let elements = getEcN(className);
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = displayState;
  }
}

/**
 * Get Html element by Id
 * @param {*} id
 */
function getId(id) {
  return document.getElementById(id);
}

/**
 * Get Html element by selector
 * @param {*} selector
 */
function getSl(selector) {
  return document.querySelector(selector);
}

/**
 * Get Html element by class name
 * @param {*} className
 */
function getEcN(className) {
  return document.getElementsByClassName(className);
}
