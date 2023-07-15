import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { format, formatDistance, parseISO } from 'date-fns';
import { Tweet } from 'src/app/interfaces/tweet.interface';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent implements OnInit {
  @Input() tweet!: Tweet;
  @Output() tweetLiked = new EventEmitter<Tweet>();
  @Output() tweetCommented = new EventEmitter<{
    tweet: Tweet;
    comment: string;
  }>();
  constructor() {}

  get tweetCreatedAt(): string {
    if (!this.tweet) {
      return '';
    }
    return formatDistance(parseISO(this.tweet?.createdAt), new Date());
  }

  commentOnTweet() {
    const comment = prompt("What's your comment?");
    if (comment && comment.trim().length) {
      this.tweetCommented.emit({
        tweet: this.tweet,
        comment,
      });
    }
  }

  ngOnInit(): void {}
}
