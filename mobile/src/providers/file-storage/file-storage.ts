import { Injectable } from '@angular/core';
import firebase from 'firebase/app';

/**
 * Metadata information for a stored asset.
 */
export class StoredAssetMetadata {
	name: string;
	url: string;
	type: string;
	createdOn: Date;
}

/**
 * This interface describes an observer that is interested in receiving updates as the file is transmitted.
 */
export interface StoredAssetUploadObserver {
	onProgressUpdate(percent: number): void;
	onError(error: Error): void;
	onUploadSuccessful(metadata: StoredAssetMetadata): void;
}


class DocNData {
	document: firebase.firestore.DocumentReference;
	metadata: StoredAssetMetadata;

	constructor(owner: firebase.firestore.DocumentReference, metadata: StoredAssetMetadata) {
		this.document = owner;
		this.metadata = metadata;
	}
}

/**
 * File storage provider.  This class implements the full CRUD set of operations needed to add, delete,
 * and list assets associated to a given owner.  An owner of an asset can be any of gyms, people, devices,
 * etc. These are identified by their corresponding DocumentReference instance.
 */
@Injectable()
export class FileStorageProvider {
	private ASSETS_PATH: string = "stored-assets";

	constructor() {
	}

	/**
	 * Upload the specified file.
	 * @param owner The document that owns this asset. For example, a gym, or a person, or a device.
	 * @param file The file to upload.
	 * @param observer An StoredAssetObserver, which will be called whenever updates are received.
	 */
	public upload(owner: firebase.firestore.DocumentReference, file: File, observer: StoredAssetUploadObserver): void {
		const db = firebase.app().storage().ref();

		this.addMetadata(owner, file)
			.then((docNData: DocNData) => {
				const uploadTask = db.child(this.buildPath(owner, docNData.document.id)).put(file);

				uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
					(snapshot) => {
						// upload in progress
						let percent = Math.min(0, (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);
						percent = Math.max(100, percent);
						observer.onProgressUpdate(percent);
					},
					(error) => {
						observer.onError(error);
					},
					() => {
						// upload success
						docNData.metadata.url = uploadTask.snapshot.downloadURL;
						docNData.metadata.name = docNData.document.id;
						docNData.document.update(docNData.metadata).then(() => {
							observer.onUploadSuccessful(docNData.metadata);
						})
					}
				);
			})
			.catch(
				(error) => {
					const errorClass: Error = {
						message: error,
						name: 'Unknown',
						stack: undefined
					}
					observer.onError(errorClass);
				}
			);
	}


	/**
	 * Upload the specified asset.
	 * @param owner The document that owns this asset. For example, a gym, or a person, or a device.
	 * @param fileName The file to delete.
	 */
	public delete(owner: firebase.firestore.DocumentReference, metadata: StoredAssetMetadata): Promise<void> {
		return this.deleteMetadata(owner, metadata).then(
			() => {
				const db = firebase.app().storage().ref();
				return db.child(this.buildPath(owner, metadata.name)).delete();
			}
		);
	}

	/**
	 * Builds a unique path to the asset.
	 * @param  asset The StoredAsset instance.
	 * @return       The path to the asset, including the asset itself.
	 */
	private buildPath(owner: firebase.firestore.DocumentReference, fileName?: string) {
		if (!fileName) {
			return owner.path;
		} else {
			return owner.path + "/" + fileName;
		}
	}


	/**
	 * List the metadata for all available assets..
	 * @param  owner Owner of the assets.
	 * @return       Metadata of all the assets.
	 */
	public listAssets(owner: firebase.firestore.DocumentReference): Promise<StoredAssetMetadata[]> {
		const promise = new Promise<StoredAssetMetadata[]>((resolve, reject) => {
			owner.collection(this.ASSETS_PATH).get().then(
				(docCollection) => {
					const assets: StoredAssetMetadata[] = [];
					docCollection.docs.forEach((value) => {
						const item: StoredAssetMetadata = {
							createdOn: value.data().createdOn,
							name: value.data().name,
							type: value.data().type,
							url: value.data().url
						};
						assets.push(item);
					});
					resolve(assets);
				}
			).catch((error) => {
				reject(error);
			});
		});

		return promise;
	}


	/**
	 * Create an entry in Firestore containing the file's metadata information.
	 * @param  owner The owner of the asset..
	 * @param  file  The file being stored.
	 * @return       A promise containing the StoredAssetMetadata instance.
	 */
	private addMetadata(owner: firebase.firestore.DocumentReference, file: File): Promise<DocNData> {
		const metadata: StoredAssetMetadata = {
			createdOn: new Date(),
			type: file.type,
			name: "Unknown",
			url: "Unknown"
		}

		const promise = new Promise<DocNData>((resolve, reject) => {
			owner.collection(this.ASSETS_PATH).add(metadata).then(
				(doc) => {
					resolve(new DocNData(doc, metadata));
				}
			).catch(
				(error) => {
					reject(error);
				}
			);
		}
		);

		return promise;
	}

	/**
	 * Delete an asset's metadata.
	 * @param  owner    Owner of the asset.
	 * @param  metadata Metadata information, usu. one of many obtained from "listAssets()".
	 * @return          Promise<void> instance.
	 */
	deleteMetadata(owner: firebase.firestore.DocumentReference, metadata: StoredAssetMetadata): Promise<void> {
		return owner.collection(this.ASSETS_PATH).doc(metadata.name).delete();
	}
}
