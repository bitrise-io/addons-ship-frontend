import { Dispatch } from 'redux';
import { createAction } from 'deox';

import api from '@/services/ship-api';
import { Uploadable } from '@/models/uploadable';
import { RootState } from '@/store';
import { uploadFileToS3 } from '@/utils/file';

import { $ } from './common';
const _uploadScreenshots = (appSlug: string, versionId: string, screenshots: Uploadable[], files: File[]) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  const {
    auth: { token }
  } = getState();

  api.setToken(token);

  dispatch(uploadScreenshots.next());

  try {
    // Get presigned Urls
    const withPresignedUrl = await api.uploadScreenshots(appSlug, versionId, screenshots);

    // Upload images to S3
    await Promise.all(
      withPresignedUrl.map(({ filename, filesize, uploadUrl }) => {
        const file = files.find(({ name, size }) => name === filename && size === filesize);

        return uploadFileToS3(file, uploadUrl);
      })
    );

    // Mark screenshots as uploaded
    await api.uploadedScreenshots(appSlug, versionId);
    dispatch(uploadScreenshots.complete());
  } catch (error) {
    dispatch(uploadScreenshots.error(error));
  }
};

const uploadScreenshots = Object.assign(_uploadScreenshots, {
  next: createAction($`UPLOAD_SCREENSHOTS_NEXT`),
  complete: createAction($`UPLOAD_SCREENSHOTS_COMPLETE`),
  error: createAction($`UPLOAD_SCREENSHOTS_ERROR`, resolve => (error: Error) => resolve(error))
});

export default uploadScreenshots;
