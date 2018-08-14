import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FeedApiProvider {
  private apiUrl: string = '';

  constructor(public http: HttpClient) {
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

  // ---------------- Feed Provider Methods ----------------
  //       ------------- Feed Instances -------------

  /*
   * Get a specified feed.
   */
  getFeed(feedID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getRequest(`feeds/${feedID}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Get a list of all feeds.
   */
  getFeeds(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.getRequest(`feeds`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Get a count of all feeds.
   */
  getFeedsCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.getRequest(`feeds/count`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Create a new feed.
   */
  createNewFeed(name: string, purpose: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = {
        name: name,
        purpose: purpose
      };

      this.postRequest(`feeds/new`, data)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Delete a feed.
   */
  deleteFeed(feedID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deleteRequest(`feeds/${feedID}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }


  //       ------------- Feed Properties -------------

  /*
   * Get a specified feed property.
   */
  getFeedProperty(feedID: number, realm: string, name: string, type: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const propertyStr = realm + '.' + name + '.' + type;

      this.getRequest(`feeds/${feedID}/properties/${propertyStr}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Get a list of all feed properties.
   */
  getFeedProperties(feedID: number): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.getRequest(`feeds/${feedID}/properties`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Get a count of all feed properties.
   */
  getFeedPropertiesCount(feedID: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.getRequest(`feeds/${feedID}/properties/count`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Create new property for a feed.
   */
  createFeedProperty(feedID: number, realm: string, name: string, type: string, value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const propertyStr = realm + '.' + name + '.' + type;
      const data = {
        value: value
      }

      this.postRequest(`feeds/${feedID}/properties/${propertyStr}`, data)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  /*
   * Delete a property from a feed.
   */
  deleteFeedProperty(feedID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deleteRequest(`feeds/${feedID}`)
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }
}
