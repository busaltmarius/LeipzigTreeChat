import type { QanaryComponentApi } from "@leipzigtreechat/qanary-api";

/**
 * The about object of the component
 */
export class QanaryComponentAbout implements QanaryComponentApi.IQanaryComponentAbout {
  /**
   * The display name of the component
   */
  public name: string;
  /**
   * A description of the component
   */
  public description: string;
  /**
   * The version of the component
   */
  public version: string;

  /**
   * The function to instantiate the object
   * @param about The options that can be passed to the object
   * @private
   */
  private constructor(about: QanaryComponentApi.IQanaryComponentAbout) {
    this.name = about.name ?? "";
    this.description = about.description ?? "";
    this.version = about.version ?? "";
  }

  /**
   * The factory method to create a `QanaryComponentAbout` object
   */
  static async create() {
    const pkg = await import(`${process.cwd()}/package.json`);
    return new QanaryComponentAbout({
      ...pkg,
    });
  }
}
