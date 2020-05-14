import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import * as M from 'materialize-css';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.css'],
})
export class StreamsComponent implements OnInit {
  token: any;
  streamsTab = false;
  topStreams = false;

  constructor(private tokenService: TokenService, private router: Router) {}

  ngOnInit(): void {
    this.streamsTab = true;
    this.token = this.tokenService.GetPayload();
    const tabs = document.querySelector('.tabs');
    M.Tabs.init(tabs, {});
  }

  changeTabs(value) {
    if (value == 'streams') {
      this.streamsTab = true;
      this.topStreams = false;
    } else {
      this.streamsTab = false;
      this.topStreams = true;
    }
  }
}
