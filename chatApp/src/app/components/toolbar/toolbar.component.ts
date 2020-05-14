import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import * as M from 'materialize-css';
import { UsersService } from 'src/app/services/users.service';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  user: any;
  notifications = [];
  socket: any;
  count = [];
  chatList = [];
  msgNumber = 0;
  receiver = [];

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService: UsersService,
    private msgService: MessageService
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit(): void {
    this.user = this.tokenService.GetPayload();
    const dropDownElement = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropDownElement, {
      coverTrigger: false,
      alignment: 'right',
    });

    const dropDownElement1 = document.querySelectorAll('.dropdown-trigger1');
    M.Dropdown.init(dropDownElement1, {
      coverTrigger: false,
      alignment: 'right',
    });

    this.getUser();
    this.socket.on(
      'refreshPage',
      () => {
        this.getUser();
      },
      (err) => {
        if (err.error.token == null) {
          this.tokenService.DeleteToken();
          this.router.navigate(['']);
        }
      }
    );
  }

  getUser() {
    this.userService.getUserById(this.user._id).subscribe((data) => {
      this.notifications = data.result.notifications.reverse();
      const value = _.filter(this.notifications, ['read', false]);
      this.count = value;
      this.chatList = data.result.chatList;
      this.checkIfRead(this.chatList);
    });
  }

  checkIfRead(arr) {
    const checkArr = [];
    for (let i = 0; i < arr.length; i++) {
      this.receiver[i] = arr[i].msgId.message[arr[i].msgId.message.length - 1];
      if (this.router.url !== `/chat/${this.receiver[i].senderName}`) {
        if (this.receiver[i].isRead == false && this.receiver[i].receiverName == this.user.username) {
          checkArr.push(1);
          this.msgNumber = _.sum(checkArr);
        }
      }
    }
  }

  markAll() {
    this.userService.markAllAsRead().subscribe((data) => {
      this.socket.emit('refresh', {});
    });
  }

  logout() {
    this.tokenService.DeleteToken();
    this.router.navigate(['']);
  }

  GoToHome() {
    this.router.navigate(['streams']);
  }

  gotoChatPage(name) {
    this.router.navigate(['chat', name]);
    this.msgService.markMessages(this.user.username, name).subscribe((data) => {
      this.socket.emit('refresh', {});
    });
  }

  markAllMessages() {
    this.msgService.markAllMessages().subscribe((data) => {
      this.socket.emit('refresh', {});
      this.msgNumber = 0;
    });
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  MessageDate(date) {
    return moment(date).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY',
    });
  }
}
