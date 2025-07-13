export default abstract class Entity {
    protected _id: string;

    constructor(id?: string) {
        this._id = id ?? crypto.randomUUID();
    }
    get id(): string {
        return this._id;
    }
}
