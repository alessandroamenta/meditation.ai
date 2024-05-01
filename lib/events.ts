// app/lib/events.ts
export const CREDITS_UPDATED_EVENT = "creditsUpdated";

export const dispatchCreditsUpdatedEvent = () => {
  window.dispatchEvent(new Event(CREDITS_UPDATED_EVENT));
};
