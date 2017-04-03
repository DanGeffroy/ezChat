import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from './message';
import { User } from './user';
import { MessagesService } from './messages.service';
import { UserService } from './user.service';
import { EmojiService } from './emoji/emoji.service';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessagesService, UserService,EmojiService]
})

export class AppComponent implements OnInit, OnDestroy{
  private allMessages : Message[];
  private currentMessage : string = "";
  private userName : string = "Anonymous";
  private onlineUsers : string[]=[];
  private errorMessage: string;

  private emojis : string[] = [];
  connection;

  constructor(private messagesService:MessagesService, private userService:UserService,private emojiService:EmojiService) {}

  newMessage() {
    let messageToSend : Message = {author:this.userName, text:this.currentMessage, img: null, youtube: null};
    this.messagesService.sendMessage(messageToSend);
    // Clear
    this.currentMessage = "";
  }

  ngOnInit() {
    // talk to the server to get a username that is not already used
    this.getEmojis();
    this.userService.getAvailableUsername();
    this.userService.getOnlineUsers()
                    .then(
                      users => {
                        this.onlineUsers = users;
                        this.userName += this.onlineUsers.length + 1;
                      },
                      error =>  this.errorMessage = <any>error);
    this.getMessagesHistory(); // Load the previous message from the server.
    this.connection = this.messagesService.getMessages().subscribe(message => {
      console.log(message);
      this.allMessages.push(message);
    });
    this.connection = this.userService.getUsers().subscribe(users => {
      this.onlineUsers = users;
    });
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  getMessagesHistory() {
    this.messagesService.getMessagesHistory()
                        .then(
                          messagesHistory => this.allMessages = messagesHistory,
                          error =>  this.errorMessage = <any>error);
  }

  changeUsername(){
    this.userService.changeUsername(this.userName);
  }
  getEmojis(){
      this.emojiService.getEmojis()
                          .then(
                            emojis => this.emojis = emojis,
                            error =>  this.errorMessage = <any>error);
  }
}
