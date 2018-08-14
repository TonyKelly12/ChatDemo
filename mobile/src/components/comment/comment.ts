import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { PostsApiProvider } from '../../providers/posts-api/posts-api';
import { PersonsApiProvider } from '../../providers/persons-api/persons-api';
import { PostProperties, FEED_TYPE, POST_TYPE } from '../../providers/app-globals/app-globals';

@Component({
    selector: 'comment',
    templateUrl: 'comment.html',
    providers: [PostsApiProvider, PersonsApiProvider]
})
export class Comment {
    public comment: PostProperties = {
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
        commentsDisabled: true,
        feedID: 0,
        feedType: ''
    };
    public footer: boolean = true;

    FEED_TYPE = FEED_TYPE;

    @Input() 
    set postComment(postComment: PostProperties) {
        this.comment = postComment;
    }

    @Input()
    set showFooter(showFooter: boolean) {
        this.footer = showFooter;
    }

    constructor(public navCtrl: NavController, public sanitizer: DomSanitizer, public postsApi: PostsApiProvider,
        public personsApi: PersonsApiProvider) {
    }
}
