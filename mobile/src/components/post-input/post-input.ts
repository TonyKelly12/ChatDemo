import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { PostsApiProvider } from '../../providers/posts-api/posts-api';
import { AppGlobals, PostProperties, FEED_TYPE, POST_TYPE } from '../../providers/app-globals/app-globals';

@Component({
    selector: 'post-input',
    templateUrl: 'post-input.html',
    providers: [PostsApiProvider]
})
export class PostInput {
    public feedData: any;
    public postData: any;
    public commentsData: Array<any>;
    public newPostText: string;

    @Input() 
    set feed(feed: any) {
        this.feedData = feed;
    }

    @Input() 
    set post(post: any) {
        this.postData = post;
    }

    @Output() resizeContent = new EventEmitter<boolean>();

    @Output() scrollToNewPost = new EventEmitter<boolean>();

    @Output() commentsNbrChange = new EventEmitter<number>();

    constructor(public postsApi: PostsApiProvider, public element: ElementRef, private _global: AppGlobals) {
    }

    textInputResized() {
        this.resizeContent.emit(true);
    }

    addPost() {
        if (!this.newPostText) return;

        let feedID, replyToPost, postToPersonID;
        if (this.feedData) {
            feedID = this.feedData.feedID;
            replyToPost = 0;
            postToPersonID = this.feedData.postedTo;
        } else if (this.postData) {
            feedID = this.postData.feedID;
            replyToPost = this.postData.postID; 
            postToPersonID = 0;
        }

        this.postsApi.createPost(feedID, this.newPostText, replyToPost, this._global.myPersonProperties.personID, 
                postToPersonID).then(async (newPost) => {
            this.newPostText = '';

            let textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
            textArea.style.overflow = 'hidden';
            textArea.style.height = 'auto';
            textArea.style.height = "20px";
            this.textInputResized();

            if (this.feedData) {
                let post = {
                    postID: newPost.postID,
                    postCommentNbr: newPost.numChildren,
                    postByPersonID: this._global.myPersonProperties.personID,
                    postToPersonID: postToPersonID
                };

                if (this.feedData.type == FEED_TYPE.chat) {
                    this.feedData.posts.push(post);

                    setTimeout(() => {  // Wait for post to render
                        this.scrollToNewPost.emit(true);
                    }, 0);
                } else {
                    this.feedData.posts.unshift(post);
                }
            } else if (this.postData) {
                this.createPostComment(newPost).then((postComment: PostProperties) => {
                    console.log(postComment);
                    this.postData.comments.push(postComment);
                    this.postData.commentsNbr++;
                    this.commentsNbrChange.emit(this.postData.commentsNbr);
                });
            }
        }).catch(err => console.log(`Error Creating New Post: ${err}`));
    }

    createPostComment(commentData) {
        let promise = new Promise((resolve, reject) => {
            let postComment: PostProperties;

            this.postsApi.getPostPersonData(commentData.postedByPersonID).then(personData => {
                postComment = {
                    postID: commentData.postID,
                    postType: POST_TYPE.full,
                    message: commentData.message,
                    postedBy: personData,
                    postedTo: personData,
                    postedOn: this.postsApi.parseIso8601DateTime(commentData.postedOnAsIso8601),
                    comments: [],
                    commentsNbr: commentData.numChildren,
                    commentsDisabled: true,
                    feedID: commentData.feedID,
                    feedType: 'comment'
                };
                resolve(postComment);
            }).catch(err => console.log(`Error Getting Person Data for Comment: ${err}`));
        });

        return promise;
    }
}
