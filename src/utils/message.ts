import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  invalidateLangCode(): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
