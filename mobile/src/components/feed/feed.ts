import { Component, Input } from '@angular/core';
import { LoadingController, Events, NavController } from 'ionic-angular';
////import { FeedApiProvider } from '../../providers/feed-api/feed-api';
import { PostsApiProvider } from '../../providers/posts-api/posts-api';
import { FeedProperties, FEED_TYPE } from '../../providers/app-globals/app-globals';

@Component({
    selector: 'feed',
    templateUrl: 'feed.html',
    //providers: [FeedApiProvider, PostsApiProvider]
})
export class Feed {
    public feed: FeedProperties = {
        feedID: 0,
        type: '',
        name: '',
        desc: '',
        postedTo: 0,
        posts: []
    };
    public loading: any;

    FEED_TYPE = FEED_TYPE;

    @Input()
    set feedID(feedID: number) {
        this.feed.feedID = feedID;
    }

    @Input()
    set feedType(feedType: FEED_TYPE) {
        this.feed.type = feedType;
    }

    @Input()
    set feedPostedTo(feedPostedTo: number) {
        this.feed.postedTo = feedPostedTo;
    }

    constructor(public navCtrl: NavController, public loadingCtrl:LoadingController, public events: Events,
                ) {
    }

    // ngOnInit() {
    //     this.loadFeedData(this.feed.feedID, this.feed.type, this.feed.postedTo).then(feed => {
    //         //console.log(`Loaded Data for Feed: `);
    //         //console.log(feed);
    //         this.feed = feed;
    //     }).catch(err => {
    //         console.log(`Error Loading Data for Feed: ${this.feed.feedID}`);
    //     });
    // }

    // loadFeedData(feedID, feedType, feedPostedTo): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         //console.log(`Loading Properies for Feed: ${feedID}`);

    //         this.loading = this.loadingCtrl.create({content : `Loading ...`});
    //         this.loading.present();

    //         let feed = {} as FeedProperties;
    //         feed.feedID = feedID;
    //         feed.type = feedType;
    //         feed.postedTo = feedPostedTo;

    //         this.feedApi.getFeedProperties(feedID).then(feedProperties => {
    //             //console.log(feedProperties);
    //             feedProperties.forEach(feedProperty => {
    //                 switch (feedProperty['propertyName']) {
    //                     case 'feed.name.txt':
    //                         feed.name = feedProperty['propertyValue']
    //                         break;
    //                     case 'feed.purpose.txt':
    //                         feed.desc = feedProperty['propertyValue']
    //                         break;
    //                 }
    //             });

    //             this.loadFeedPosts(feed).then((feedPosts) => {
    //                 //console.log(`Feed Posts: `);
    //                 //console.log(feedPosts);
    //                 feed.posts = Array.from(feedPosts);

    //                 resolve(feed);
    //             }).catch(err => {
    //                 console.log(`Error Loading Posts for Feed: ${this.feed.feedID}`);
    //                 reject(err);
    //             });
    //         }).catch(err => {
    //             console.log(`Error Loading Properties for Feed: ${this.feed.feedID}`);
    //             this.loading.dismissAll();
    //             reject(err);
    //         });
    //     });
    // }

    // loadFeedPosts(feed): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         //console.log(`Loading Posts for Feed: ${feed.feedID}`);

    //         this.postsApi.getFeedPosts(feed.feedID).then(feedPosts => {
    //             let posts = [];
    //             feedPosts.forEach(feedPost => {
    //                 // Don't include post comments
    //                 if (typeof feedPost.inResponseToPostID === 'undefined') {
    //                     //console.log(feedPost);

    //                     let post = {
    //                         postID: feedPost.postID,
    //                         postCommentNbr: feedPost.numChildren,
    //                         postByPersonID: feedPost.postedByPersonID,
    //                         postToPersonID: feedPost.postedToPersonID
    //                     };
    //                     posts.push(post);
    //                 }
    //             });

    //             if (feed.type == FEED_TYPE.chat) {
    //                 posts.sort(function(a, b) {
    //                     return a.postID - b.postID;
    //                 });
    //             } else {
    //                 posts.sort(function(a, b) {
    //                     return b.postID - a.postID;
    //                 });
    //             }

    //             this.loading.dismissAll();

    //             resolve(posts);
    //         }).catch(err => {
    //             console.log(`Error Loading Posts for Feed: ${this.feed.feedID}`);
    //             this.loading.dismissAll()
    //             reject(err);
    //         });
    //     });
    // }

    // viewMorePosts() {
    //     switch (this.feed.type) {
    //         case 'forum':
    //             this.navCtrl.setRoot('Forum', {feed: this.feed, fromPage: this.navCtrl.getActive().name});
    //             break;
    //         case 'announcement':
    //             this.navCtrl.setRoot('Announcements', {feed: this.feed, fromPage: this.navCtrl.getActive().name});
    //             break;
    //     }
    // }
}
