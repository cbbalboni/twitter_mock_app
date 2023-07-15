import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { formatISO } from 'date-fns';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-new-tweet',
  templateUrl: './new-tweet.component.html',
  styleUrls: ['./new-tweet.component.scss'],
})
export class NewTweetComponent implements OnInit {
  @Output() newTweet = new EventEmitter<Omit<Tweet, 'id'>>();
  @Input() user!: User;
  tweetMessage = '';
  constructor() {}

  get isTweetEmptyOrMajorChr() {
    return this.tweetMessage.trim().length === 0 || this.tweetMessage.trim().length>100;
  }

  ngOnInit(): void {}

  onSubmit($event: Event) {
    $event.preventDefault();
    if (this.isTweetEmptyOrMajorChr) {
      return;
    }
    this.newTweet.emit({
      content: this.tweetMessage,
      likedBy: [],
      commentedBy: [],
      createdAt: formatISO(new Date()),
      by: {
        id: this.user.uid,
        name: this.user.displayName || this.user.email || '',
        username: '',
        profileURL: this.user.photoURL || '',
      },
    });
    this.tweetMessage = '';
  }
}
