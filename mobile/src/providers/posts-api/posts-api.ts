import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import { PersonsApiProvider } from '../persons-api/persons-api';

@Injectable()
export class PostsApiProvider {
  private apiUrl: string = '';

  constructor(public http: HttpClient, public personsApi: PersonsApiProvider) {
  }

  getRequest(url: string): Promise<any> {
    //console.log(`GET url: ${url}`);
    return this.http.get(this.apiUrl + url).toPromise()
      .then(resp => resp)
      .catch(e => this.handleError(e, 'GET'));
  }

  postRequest(url: string, data: any): Promise<any> {
    //console.log(`POST url: ${url}, data: ${data}`);
    return this.http.post(this.apiUrl + url, data).toPromise()
      .then(resp => resp)
      .catch(e => this.handleError(e, 'POST'));
  }

  putRequest(url: string, data: any): Promise<any> {
    //console.log(`PUT url: ${url}, data: ${data}`);
    return this.http.put(this.apiUrl + url, data).toPromise()
      .then(resp => resp)
      .catch(e => this.handleError(e, 'PUT'));
  }

  deleteRequest(url: string): Promise<any> {
    //console.log(`DELETE url: ${url}`);
    return this.http.delete(this.apiUrl + url).toPromise()
      .then(resp => resp)
      .catch(e => this.handleError(e, 'DELETE'));
  }

  handleError(error: Response, httpMethod: string) {
    console.log(`HTTP ${httpMethod} Error: ${JSON.stringify(error)}`);
    return Promise.reject(error);
  }

  // ---------------- Post Provider Methods ----------------
  //       ------------- Post Instances -------------

  /*
   * Get a post.
   */
  getPost(postID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getRequest(`posts/${postID}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Get a list of all PARENT posts from a specified feed.
   */
  getFeedPosts(feedID: number): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      const propertyStr = `?feedID=${feedID}&inResponseToPostID=0`;

      this.getRequest(`posts${propertyStr}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Get a list of all CHILDREN posts from a specified feed.
   */
  getPostsChildren(feedID: number, inResponseToPostID: number, startIndex: number, maxResults): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      const propertyStr = `?feedID=${feedID}&inResponseToPostID=${inResponseToPostID}&startIndex=${startIndex}` +
                          `&maxResults=${maxResults}`;

      this.getRequest(`posts${propertyStr}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Get a chat post.
   */
  getChatPost(postedByPersonID, postedToPersonID): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        const propertyStr = `?postedByPersonID=${postedByPersonID}&postedToPersonID=${postedToPersonID}` +
                            `&startIndex=0&maxResults=1`;

        this.getRequest(`posts${propertyStr}`)
          .then(resp => resolve(resp))
          .catch(err => reject(err));
    });
  }

  /*
   * Get all chat posts.
   */
  getAllChatPosts(personID): Promise<Array<any>> {
    let allMyPostsPromise = new Promise((resolve, reject) => {
      this.getAllMyPosts(personID)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });

    let allPostsToMePromise = new Promise((resolve, reject) => {
      this.getAllPostsToMe(personID)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });

    return Promise.all([allMyPostsPromise, allPostsToMePromise]);
/*
    return new Promise((resolve, reject) => {
        this.getAllMyPosts(personID)
          .then(resp => resolve(resp))
          .catch(err => reject(err));
    });
*/
  }

  /*
   * Get all posts by me.
   */
  getAllMyPosts(postedByPersonID): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        const propertyStr = `?postedByPersonID=${postedByPersonID}&postedToPersonID=0&startIndex=0&maxResults=0`;

        this.getRequest(`posts${propertyStr}`)
          .then(resp => resolve(resp))
          .catch(err => reject(err));
    });
  }

  /*
   * Get all posts to me.
   */
  getAllPostsToMe(postedToPersonID): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        const propertyStr = `?postedByPersonID=0&postedToPersonID=${postedToPersonID}&startIndex=0&maxResults=0`;

        this.getRequest(`posts${propertyStr}`)
          .then(resp => resolve(resp))
          .catch(err => reject(err));
    });
  }

  /*
   * Get a count of all posts from a specified feed.
   */
  getPostsCount(feedID: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.getRequest(`posts/count/${feedID}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Create new post for a specified feed.
   */
  createPost(feedId: number, post: string, responseTo: number, postedBy: number, postedTo: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const dateNow = new Date();
      const newPost = {
        'feedID': feedId,
        'message': post,
        'inResponseToPostID': responseTo,
        'postedByPersonID': postedBy,
        'postedToPersonID': postedTo,
        'postedOnAsIso8601': dateNow.toISOString()
      };

      this.postRequest(`posts/new`, newPost)
        .then((resp) => resolve(resp))
        .catch((err) => reject(err));
    });
  }

  /*
   * Delete a post (and its children) from a feed.
   */
  deletePost(postID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deleteRequest(`posts/${postID}`)
        .then((resp) => resolve(resp))
        .catch((err) => reject(err));
    });
  }

  // Parse the saved date in Iso8601 format to a specified format
  parseIso8601DateTime(Iso8601DateTime) {
    let formattedPostDateTime;
    const currDateTime = new Date();
    const postDateTime = new Date(Iso8601DateTime);
    const postDateDiff =
        Math.floor((Date.UTC(currDateTime.getFullYear(), currDateTime.getMonth(), currDateTime.getDate()) -
                    Date.UTC(postDateTime.getFullYear(), postDateTime.getMonth(), postDateTime.getDate()))
                  / (1000 * 60 * 60 * 24));

    if (postDateDiff == 0) {  // Posted today
      const postHourDiff = currDateTime.getHours() - postDateTime.getHours();
      const postMinDiff = currDateTime.getMinutes() - postDateTime.getMinutes();

      if (postHourDiff == 0 && postMinDiff == 0) {  // Posted just now
        formattedPostDateTime = 'Now';
      } else {  // Posted so many hours or minutes ago
        if (postHourDiff > 0) {
          formattedPostDateTime = postHourDiff + ((postHourDiff == 1) ? ' hour ago' : ' hours ago');
        } else {
          formattedPostDateTime = postMinDiff + ((postMinDiff == 1) ? ' minute ago' : ' minutes ago');
        }
      }
    } else if (postDateDiff > 0 && postDateDiff < 8) {  // Posted this past week
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      formattedPostDateTime = days[postDateTime.getUTCDay()] + ' at ' + postDateTime.toLocaleString('en-US', options);
    } else if (postDateDiff >= 8) { // Posted longer than a week ago
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                      'October', 'November', 'December'];
      const options = {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
      };
      formattedPostDateTime = months[postDateTime.getMonth()] + ' ' + postDateTime.getDate() + ' at ' +
                              postDateTime.toLocaleString('en-US', options);
    }

    return formattedPostDateTime;
  }

  // Get person data for a post.
  getPostPersonData(personID): Promise<any> {
    let promise = new Promise(async (resolve, reject) => {
      let personData = {
          personID: personID,
          profilePic: '',
          displayName: ''
      }

      await this.personsApi.getPersonsProperties(personID).then(properties => {
        properties.forEach((property) => {
          switch (property.propertyName) {
            case 'person.username.txt':
              personData.displayName = property.propertyValue;
              break;
            case 'person.avatar.png':
              personData.profilePic = property.propertyValue;
              break;
          }
        });
        resolve(personData);
      }).catch(err => reject(err));
    });

    return promise;
  }
}
