// FUCK gradio!

export { Client } from "./client";

export { handle_file } from "./helpers/data";
export { FileData, prepare_files, upload } from "./upload";
export { predict } from "./utils/predict";
export { submit } from "./utils/submit";
export { upload_files } from "./utils/upload_files";

export type {
  client_return,
  Config,
  LogMessage,
  Payload,
  RenderMessage,
  SpaceStatus,
  Status,
  StatusMessage,
  UploadResponse,
} from "./types";

export { MISSING_CREDENTIALS_MSG } from "./constants";

// todo: remove in @gradio/client v1.0
export { client, duplicate_space as duplicate } from "./client";
