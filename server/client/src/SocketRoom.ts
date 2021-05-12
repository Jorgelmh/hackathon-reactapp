import socketIOClient, { Socket } from 'socket.io-client'
import User from '../../interfaces/entities/User'
import {
  ENTER_ROOM_COUNSELOR,
  ENTER_ROOM_PATIENT,
  SET_UP_CALL,
  USER_CONNECTED,
  JOINED_CALL,
} from '../../sockets/Channels'

import Peer from 'peerjs'

/**
 *  ==============================================
 *     SOCKET.IO CLIENT FOR A VIDEO CHAT ROOM
 *  ==============================================
 */
export default class SocketRoom {
  /* Socket.io client */
  private socketClient: Socket

  /* PeerJS connection */
  private peerClient: Peer
  private myVideo: HTMLVideoElement

  constructor(
    private roomid: string,
    private peerId: number | string,
    private videoGrid: HTMLElement
  ) {
    this.socketClient = socketIOClient()
    this.peerClient = new Peer(String(this.peerId))
    this.myVideo = document.createElement('video')
    this.myVideo.muted = true
    this.handleMessages()
  }

  /* Enter to socket.io room on the server */
  public enterSocketRoom(): void {
    /* Check if the user is logged in */
    const token = localStorage.getItem('token')
    if (token) {
      const user: User = JSON.parse(atob(token.split('.')[1]))

      /* If the user logged in is a Patient */
      if ('mood' in user)
        this.socketClient.emit(ENTER_ROOM_PATIENT, {
          token,
          roomid: this.roomid,
          guestId: null,
        })
      else
        this.socketClient.emit(ENTER_ROOM_COUNSELOR, {
          token,
          roomid: this.roomid,
        })
    }

    /* Otherwise it is a GUEST */
    const guestid = localStorage.getItem('guestid')
    if (guestid) {
      this.socketClient.emit(ENTER_ROOM_PATIENT, {
        token: null,
        roomid: this.roomid,
        guestid,
      })
    }
  }

  /* Handle socket messages */
  public handleMessages(): void {
    /* When the user has been confirmed to belong to the room we can stream */
    /* Get current users video stream */
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream: MediaStream) => {
        this.addVideoStream(this.myVideo, stream)

        this.peerClient.on('call', (call) => {
          console.log('Call incoming')
          call.answer(stream)
          const userVideo = document.createElement('video')
          call.on('stream', (otherUserStream) => {
            this.addVideoStream(userVideo, otherUserStream)
          })
        })

        this.socketClient.on(USER_CONNECTED, ({ peerid }) => {
          this.connectToUser(peerid, stream)
        })

        this.socketClient.emit(JOINED_CALL, {
          roomid: this.roomid,
          peerid: this.peerId,
        })
      })

    this.peerClient.on('error', (err) => {
      console.log(err)
    })
  }

  /* Add video stream */
  public addVideoStream(video: HTMLVideoElement, stream: MediaStream): void {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    this.videoGrid.append(video)
  }

  /* Connect to the other user */
  public connectToUser(id: string, stream: MediaStream): void {
    console.log(`Calling id ${id}`)
    const call = this.peerClient.call(id, stream)
    const video = document.createElement('video')
    call.on('stream', (userVideoStream: MediaStream) => {
      this.addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
      video.remove()
    })
  }
}
