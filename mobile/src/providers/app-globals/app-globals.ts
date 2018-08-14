import { Injectable } from '@angular/core';

// Definition for the selectable sports
export type SportsType = {title: string,
                   propertyName: string,
                         imgUrl: string,
                       favorite: boolean};

// Defined Profile Visibility settings
export enum PROFILE_VISIBILITY {
    public  = 'public',
    friends = 'friends',
    private = 'private'
}

// Person properties
export interface PersonProperties {
    personID: number,
    displayName: string,
    profilePic: any,
    shortBio: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    height: string,
    weight: string,
    profileVisibility: PROFILE_VISIBILITY,
    favoriteSports: Array<SportsType>
}

// Defined Feed types
export enum FEED_TYPE {
    feed            = 'feed',
    announcement    = 'announcement',
    forum           = 'forum',
    chat            = 'chat',
    selectedPost    = 'selectedPost',
    comment         = 'comment'
}

// Feed properties
export interface FeedProperties {
    feedID: number;
    type: string;
    name: string;
    desc: string;
    postedTo: number;
    posts: Array<any>;
}

// Defined Post types
export enum POST_TYPE {
    slim    = 'slim',
    full    = 'full'
}

// Post properties
export interface PostProperties {
    postID: number;
    postType: string;
    message: string;
    postedBy: {
        personID,
        displayName,
        profilePic
    };
    postedTo: {
        personID,
        displayName,
        profilePic
    };
    postedOn: string;
    comments: Array<any>;
    commentsNbr: number;
    commentsDisabled: boolean;
    feedID: number;
    feedType: string;
}


@Injectable()
export class AppGlobals {
    // My default properties
    myPersonProperties: PersonProperties = {
        personID: 0,
        displayName: '',
        profilePic: '',
        shortBio: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        height: '',
        weight: '',
        profileVisibility: PROFILE_VISIBILITY.friends,
        favoriteSports: []
    };

    allSports: Array<SportsType>;
    userLat: number;
    userLng: number;
    userLocation:any;
}
