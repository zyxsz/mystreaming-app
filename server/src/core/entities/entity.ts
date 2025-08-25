import { UniqueEntityID } from "./unique-entity-id";

export abstract class Entity<Props, Relations = {}> {
  private _id: UniqueEntityID;
  protected _relations?: Partial<Relations>;
  protected props: Props;

  get id() {
    return this._id;
  }

  protected constructor(
    props: Props,
    id?: UniqueEntityID,
    relations?: Partial<Relations>
  ) {
    this.props = props;
    this._id = id ?? new UniqueEntityID();
    this._relations = relations;
  }

  public get relations() {
    return this._relations;
  }

  public equals(entity: Entity<unknown>) {
    if (entity === this) {
      return true;
    }

    if (entity.id === this._id) {
      return true;
    }

    return false;
  }

  public set relations(v) {
    this._relations = v;
  }
}
