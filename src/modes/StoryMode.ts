import { StubMode } from "./StubMode";

/**
 * Story mode — follows the narrative beats of the original PS1 campaign.
 * Not yet implemented; currently a stub.
 */
export class StoryMode extends StubMode {
  readonly name = "Story";
  protected titleKey = "stub.story.title";
  protected subtitleKey = "stub.story.subtitle";
}
