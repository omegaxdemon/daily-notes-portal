/**
 * driveService.js
 *
 * Thin wrapper around the Google Drive v3 API.
 *
 * Uses a Google Service Account so the backend can list files without
 * requiring user OAuth.
 *
 * If Google Drive isn't configured, the service automatically falls back
 * to a mocked dataset so the frontend remains fully testable.
 */

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
];

let cachedDrive = null;
let cachedDriveError = null;

/**
 * Lazily creates the Google Drive client.
 */
function getDriveClient() {
  if (cachedDrive) return cachedDrive;
  if (cachedDriveError) return null;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

  if (!keyPath) {
    console.warn(
      "[driveService] GOOGLE_SERVICE_ACCOUNT_KEY_PATH not set. Using MOCK mode."
    );
    cachedDriveError = new Error("Missing key path");
    return null;
  }

  const absoluteKeyPath = path.isAbsolute(keyPath)
    ? keyPath
    : path.join(__dirname, "..", keyPath);

  if (!fs.existsSync(absoluteKeyPath)) {
    console.warn(
      `[driveService] Service account key not found: ${absoluteKeyPath}`
    );

    cachedDriveError = new Error("Key file missing");
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: absoluteKeyPath,
      scopes: SCOPES,
    });

    cachedDrive = google.drive({
      version: "v3",
      auth,
    });

    return cachedDrive;

  } catch (err) {
    console.error(
      "[driveService] Failed to initialise Google Drive:",
      err
    );

    cachedDriveError = err;
    return null;
  }
}

/**
 * Escapes single quotes inside Drive queries.
 */
function escapeQ(value) {
  return String(value).replace(/'/g, "\\'");
}

/**
 * Finds the folder whose name matches the given date.
 */
async function findDateFolderId(
  drive,
  parentFolderId,
  dateFolderName
) {
  const q = [
    `'${escapeQ(parentFolderId)}' in parents`,
    "mimeType = 'application/vnd.google-apps.folder'",
    `name = '${escapeQ(dateFolderName)}'`,
    "trashed = false",
  ].join(" and ");

  const { data } = await drive.files.list({
    q,
    fields: "files(id,name)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (!Array.isArray(data.files) || data.files.length === 0) {
    return null;
  }

  return data.files[0].id;
}

/**
 * Lists every file inside a folder.
 */
async function listFilesInFolder(drive, folderId) {

  const files = [];
  let pageToken;

  do {

    const { data } = await drive.files.list({
      q: `'${escapeQ(folderId)}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
      fields:
        "nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)",
      pageSize: 100,
      pageToken,
      orderBy: "name",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    (data.files || []).forEach(file => {

      files.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? Number(file.size) : null,
        modifiedTime: file.modifiedTime ?? null,

        viewUrl:
          file.webViewLink ||
          `https://drive.google.com/file/d/${file.id}/view`,

        downloadUrl:
          file.webContentLink ||
          `https://drive.google.com/uc?export=download&id=${file.id}`,
      });

    });

    pageToken = data.nextPageToken;

  } while (pageToken);

  return files;
}

/**
 * Mock data used when Google Drive isn't configured.
 */
function mockFilesForDate(dateFolderName) {

  const mocks = {

    "08-07-26": [
      {
        id: "mock-cn",
        name: "Computer Networks.pdf",
        mimeType: "application/pdf",
      },
      {
        id: "mock-ml",
        name: "Machine Learning.pdf",
        mimeType: "application/pdf",
      },
      {
        id: "mock-lab",
        name: "Lab Files.rar",
        mimeType: "application/vnd.rar",
      },
    ],

    "09-07-26": [
      {
        id: "mock-notes",
        name: "Notes.pdf",
        mimeType: "application/pdf",
      },
      {
        id: "mock-assign",
        name: "Assignment.docx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    ],

  };

  const list = mocks[dateFolderName];

  if (!list) {
    return null;
  }

  return list.map(file => ({
    ...file,
    size: null,
    modifiedTime: null,
    viewUrl: `https://drive.google.com/file/d/${file.id}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
    _mock: true,
  }));
}

/**
 * Public API
 */
async function listNotesForDate(dateFolderName) {

  const drive = getDriveClient();
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  if (!drive || !parentFolderId) {

    const mocked = mockFilesForDate(dateFolderName);

    return {
      mode: "mock",
      found: Boolean(mocked),
      files: mocked || [],
      note:
        "Google Drive is not configured. Showing mocked demo data.",
    };

  }

  const folderId = await findDateFolderId(
    drive,
    parentFolderId,
    dateFolderName
  );

  if (!folderId) {
    return {
      mode: "live",
      found: false,
      files: [],
    };
  }

  const files = await listFilesInFolder(
    drive,
    folderId
  );

  return {
    mode: "live",
    found: true,
    files,
  };
}

module.exports = {
  listNotesForDate,
};