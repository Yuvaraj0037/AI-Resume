import api from "./api";

function validateId(
  id,
  fieldName
) {
  const value = String(
    id || ""
  ).trim();

  if (!value) {
    throw new Error(
      `${fieldName} is required`
    );
  }

  return value;
}

export async function sendCoachMessage({
  resumeId,
  conversationId,
  message,
}) {
  const safeResumeId =
    validateId(
      resumeId,
      "Resume ID"
    );

  const safeMessage = String(
    message || ""
  ).trim();

  if (!safeMessage) {
    throw new Error(
      "Message is required"
    );
  }

  const payload = {
    resumeId: safeResumeId,
    message: safeMessage,
  };

  if (conversationId) {
    payload.conversationId =
      validateId(
        conversationId,
        "Conversation ID"
      );
  }

  const response =
    await api.post(
      "/coach/chat",
      payload
    );

  return response.data;
}

export async function getCoachConversations() {
  const response =
    await api.get(
      "/coach/conversations"
    );

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.conversations
    )
  ) {
    return data.conversations;
  }

  if (
    Array.isArray(
      data?.data?.conversations
    )
  ) {
    return data.data.conversations;
  }

  return [];
}

export async function getCoachConversation(
  conversationId
) {
  const safeId = validateId(
    conversationId,
    "Conversation ID"
  );

  const response =
    await api.get(
      `/coach/conversations/${safeId}`
    );

  const data = response.data;

  return (
    data?.conversation ||
    data?.data?.conversation ||
    data?.data ||
    data
  );
}

export async function deleteCoachConversation(
  conversationId
) {
  const safeId = validateId(
    conversationId,
    "Conversation ID"
  );

  const response =
    await api.delete(
      `/coach/conversations/${safeId}`
    );

  return response.data;
}