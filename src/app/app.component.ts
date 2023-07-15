import { Component } from '@angular/core';
import { Tweet } from './interfaces/tweet.interface';
import { User, Auth, user } from '@angular/fire/auth';
import {
  collection,
  collectionChanges,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getFirestore,
  orderBy,
  query,
  CollectionReference,
  DocumentChange,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'twitter';
  user$: Observable<User | null>;

  tweets: Tweet[] = [];

  constructor(auth: Auth) {
    this.user$ = user(auth);
    this.getTweet();
  }

  async getTweet() {
    const user = await this.getUser();
    collectionChanges<Tweet>(
      query<Tweet>(
        collection(getFirestore(), 'zeets') as CollectionReference<Tweet>,
        orderBy('createdAt', 'desc')
      )
    ).subscribe((zeets) => {
      console.log(zeets);
      zeets.map((snapshot) => {
        this.onTweetSnapshot(snapshot, user);
      });
    });
  }

  onTweetSnapshot(change: DocumentChange<Tweet>, user: User | null) {
    const data = change.doc.data() as Tweet;
    switch (change.type) {
      case 'added':
        const zeet = {
          ...data,
          id: change.doc.id,
          liked: !!user && !!data.likedBy.includes(user.uid),
        };
        this.tweets.splice(change.newIndex, 0, zeet);
        break;
      case 'removed':
        this.tweets.splice(change.oldIndex, 1);
        break;
      case 'modified':
        if (change.newIndex === change.oldIndex) {
          this.tweets[change.oldIndex] = {
            ...data,
            id: change.doc.id,
            liked: !!user && !!data.likedBy.includes(user.uid),
          };
        } else {
          this.tweets.splice(change.oldIndex, 1);
          this.tweets.splice(change.newIndex, 0, {
            ...data,
            id: change.doc.id,
            liked: !!user && !!data.likedBy.includes(user.uid),
          });
        }
        break;
    }
  }

  async getUser(): Promise<User | null> {
    const user = await this.user$.pipe(take(1)).toPromise();
    return user || null;
  }

  addNewZeet(newTweet: Omit<Tweet, 'id'>) {
    addDoc(collection(getFirestore(), 'zeets'), newTweet);
  }

  async onTweetLike(tweet: Tweet) {
    const user = await this.getUser();
    if (!user) {
      return;
    }
    const likeDocRef = doc(
      getFirestore(),
      `zeets/${tweet.id}/likes/${user.uid}`
    );
    const document = await getDoc(likeDocRef);
    const docExists = document.exists();
    if (docExists) {
      tweet.likedBy = tweet.likedBy.filter((id) => id !== user.uid);
      tweet.liked = false;
      await deleteDoc(likeDocRef);
    } else {
      tweet.likedBy.push(user.uid);
      tweet.liked = true;
      await setDoc(likeDocRef, {
        id: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
    const docRef = doc(getFirestore(), `zeets/${tweet.id}`);
    const { liked, commented, ...updatedZeet } = tweet;
    updateDoc(docRef, {
      ...updatedZeet,
    });
  }

  async onTweetComment(event: { tweet: Tweet; comment: string }) {
    const { tweet, comment } = event;
    if (tweet.commentedBy.length === 0) {
      tweet.commentedBy.push(Date.now().toString());
    } else {
      tweet.commentedBy.length = 0;
    }
    console.log(tweet);
  }
}
