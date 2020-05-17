import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import _ from 'lodash';
import { TokenService } from 'src/app/services/token.service';
import io from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
})
export class PeopleComponent implements OnInit {
  socket: any;
  users = [];
  loggedInUser: any;
  userArr = [];
  onlineusers = [];

  constructor(private userService: UsersService, private tokenService: TokenService, private router: Router) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit(): void {
    this.loggedInUser = this.tokenService.GetPayload();
    this.GetUsers();
    this.GetUser();
    this.socket.on('refreshPage', () => {
      this.GetUsers();
      this.GetUser();
    });
  }

  GetUsers() {
    this.userService.getAllUsers().subscribe((data) => {
      _.remove(data.result, { username: this.loggedInUser.username });
      this.users = data.result;
    });
  }

  GetUser() {
    this.userService.getUserById(this.loggedInUser._id).subscribe((data) => {
      this.userArr = data.result.following;
    });
  }

  followUser(user) {
    this.userService.followUser(user._id).subscribe((data) => {
      this.socket.emit('refresh', {});
    });
  }

  viewUser(user) {
    this.router.navigate([user.username]);
    if (this.loggedInUser.username !== user.username) {
      this.userService.viewProfileNotification(user._id).subscribe(
        (data) => {
          this.socket.emit('refresh', {});
        },
        (err) => console.log(err)
      );
    }
  }

  checkInArray(arr, id) {
    const result = _.find(arr, ['userFollowed._id', id]);
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  online(event) {
    this.onlineusers = event;
  }

  checkIfOnline(name) {
    const result = _.indexOf(this.onlineusers, name);
    if (result > -1) {
      return true;
    } else {
      return false;
    }
  }
}
