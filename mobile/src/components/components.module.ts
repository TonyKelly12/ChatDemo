import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular'
import { AngularFittextModule } from 'angular-fittext';
import { DirectivesModule } from '../directives/directives.module';
import { Feed } from './feed/feed';
import { Post } from './post/post';
import { Comment } from './comment/comment';
import { PostInput } from './post-input/post-input';
import { NavBarComponent } from './nav-bar/nav-bar';

import { PointsRankingsCardComponent } from './points-rankings-card/points-rankings-card';
import { ChartsModule } from 'ng2-charts';
import { DatePipe } from '@angular/common';

import { EmojiPickerComponent } from './emoji-picker/emoji-picker';
import { FriendPickerComponent } from './friend-picker/friend-picker';
import { ProfileEditorComponent } from './profile-editor/profile-editor';

@NgModule({
	declarations: [Feed, Post, Comment, PostInput,
		NavBarComponent,
		
		PointsRankingsCardComponent,
   
	EmojiPickerComponent,
	FriendPickerComponent,
    
    ProfileEditorComponent
	],
	imports: [IonicModule, AngularFittextModule, DirectivesModule, ChartsModule],
	exports: [Feed, Post, Comment, PostInput,
		NavBarComponent,
	
		PointsRankingsCardComponent,
    
	FriendPickerComponent,
	EmojiPickerComponent,
   
    ProfileEditorComponent
	],
	providers: [DatePipe]
})
export class ComponentsModule { }
