import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as M from 'materialize-css';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import * as moment from 'moment';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css'],
})
export class ViewUserComponent implements OnInit, AfterViewInit {
  tabElement: any;
  postTab = false;
  followingTab = false;
  followersTab = false;
  posts = [];
  following = [];
  followers = [];
  user: any;
  name: any;

  constructor(private route: ActivatedRoute, private userService: UsersService) {}

  ngOnInit(): void {
    this.postTab = true;
    const tabs = document.querySelector('.tabs');
    M.Tabs.init(tabs);
    this.tabElement = document.querySelector('.nav-content');

    this.route.params.subscribe((params) => {
      this.name = params.name;
      this.getUserData(this.name);
    });
  }

  getUserData(name) {
    this.userService.getUserByName(name).subscribe(
      (data) => {
        this.user = data.result;
        this.posts = data.result.posts.reverse();
        this.following = data.result.following;
        this.followers = data.result.followers;
      },
      (err) => console.log(err)
    );
  }

  ngAfterViewInit() {
    this.tabElement.style.display = 'none';
  }

  changeTab(value) {
    if (value == 'posts') {
      this.postTab = true;
      this.followingTab = false;
      this.followersTab = false;
    }

    if (value == 'following') {
      this.postTab = false;
      this.followingTab = true;
      this.followersTab = false;
    }

    if (value == 'followers') {
      this.postTab = false;
      this.followingTab = false;
      this.followersTab = true;
    }
  }

  timeFromNow(time) {
    return moment(time).fromNow();
  }
}
