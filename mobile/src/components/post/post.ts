import { Component, Input } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { PostsApiProvider } from '../../providers/posts-api/posts-api';
import { PersonsApiProvider } from '../../providers/persons-api/persons-api';
import { AppGlobals, PostProperties, FEED_TYPE, POST_TYPE } from '../../providers/app-globals/app-globals';

@Component({
    selector: 'post',
    templateUrl: 'post.html',
    providers: [PostsApiProvider, PersonsApiProvider]
})
export class Post {
    public post: PostProperties = {
        postID: 0,
        postType: POST_TYPE.full,
        message: '',
        postedBy: {
            personID: 0,
            displayName: '',
            profilePic: ''
        },
        postedTo: {
            personID: 0,
            displayName: '',
            profilePic: ''
        },
        postedOn: '',
        comments: [],
        commentsNbr: 0,
        commentsDisabled: false,
        feedID: 0,
        feedType: ''
    };
    public footer: boolean = true;

    FEED_TYPE = FEED_TYPE; 
    POST_TYPE = POST_TYPE;

    @Input()
    set postID(postID: number) {
        this.post.postID = postID;
        this.loadPostData();
    }

    @Input()
    set feedType(feedType: string) {
        this.post.feedType = feedType;
    }

    @Input()
    set postType(postType: string) {
        this.post.postType = postType;
    }

    @Input()
    set showFooter(showFooter: boolean) {
        this.footer = showFooter;
    }

    @Input()
    set commentsNbr(commentsNbr: number) {
        this.post.commentsNbr = commentsNbr;
    }

    @Input()
    set commentsDisabled(commentsDisabled: boolean) {
        this.post.commentsDisabled = commentsDisabled;
    }

    constructor(public navCtrl: NavController, public events: Events, public sanitizer: DomSanitizer,
                public postsApi: PostsApiProvider, public personsApi: PersonsApiProvider,
                private _global: AppGlobals) {
    }

    loadPostData() {
        //console.log(`Loading Data for Post: ${this.post.postID}`);
        //console.log(this.post);
        this.postsApi.getPost(this.post.postID).then(postData => {
            this.post.message = postData.message;
            this.post.commentsNbr = postData.numChildren;
            this.post.feedID = postData.feedID;
            this.post.postedOn = this.postsApi.parseIso8601DateTime(postData.postedOnAsIso8601);
            this.postsApi.getPostPersonData(postData.postedByPersonID).then(personsData => {
                this.post.postedBy = personsData;
            }).catch(() => console.log(`Error Loading By Person Data for Post: ${this.post.postID}`));

            if (postData.postedToPersonID) {
                this.postsApi.getPostPersonData(postData.postedToPersonID).then(personsData => {
                    this.post.postedTo = personsData;
                }).catch(() => console.log(`Error Loading To Person Data for Post: ${this.post.postID}`));
            }
        }).catch(() => console.log(`Error Loading Data for Post: ${this.post.postID}`));
    }

    likePost() {
        console.log('OMUHGERD I LOVE THIS POST!');
    }

    replyToPost() {
        //console.log('OMUHGERD I REPLIED TO THIS POST: !');
        this.navCtrl.setRoot('PostComments', {post: this.post, fromPage: this.navCtrl.getActive().name});
    }

    sharePost() {
        console.log('OMUHGERD I SHARED THIS POST!');
    }

    goToChat(chatPost) {
        this.navCtrl.setRoot('Chat', {chatFeedID: chatPost.feedID});
    }
}
