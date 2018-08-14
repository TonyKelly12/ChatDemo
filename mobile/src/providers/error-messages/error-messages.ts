import { Injectable } from '@angular/core';

@Injectable()
export class ErrorMessagesProvider {
 
    formValidation = {
        userID_required: 'Please enter a user ID',
        userID_length: 'User ID must be at least 2 numbers',
        first_name_required: 'Please enter a first name',
        first_name_length: 'First name must be at least 2 characters',
        last_name_required: 'Please enter a last name',
        last_name_length: 'Last name must be at least 2 characters',
        profile_status_required: 'Please select intial profile status',
        user_name_required: 'Please enter username',
        user_name_length: 'Must be at least 3 characters',
        favQuote_min: 'Favorite Quote must be atleast 2 characters long'
    }
}
