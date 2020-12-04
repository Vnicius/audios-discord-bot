class Guild {
  constructor(id) {
    this.id = id;
    this.connection = null;
    this.vChannelId = null;
    this.permissions = [];
  }

  setId(id) {
    this.id = id;
  }

  setVChannelId(vChannelId) {
    this.vChannelId = vChannelId;
  }

  setConnection(connection) {
    this.connection = connection;
  }

  setPermissions(permissions) {
    this.permissions = permissions;
  }

  getId() {
    return this.id;
  }

  getVChannelId() {
    return this.vChannelId;
  }

  getConnection() {
    return this.connection;
  }

  getPermissions() {
    return this.permissions;
  }

  addPermission(role) {
    const { permissions } = this;

    if (!permissions.includes(role)) {
      this.permissions = [...this.permissions, role];
    }
  }

  removePermission(role) {
    const { permissions } = this;

    if (permissions.includes(role)) {
      this.permissions = permissions.filter((element) => element !== role);
    }
  }

  hasPermission(role) {
    return this.permissions.includes(role);
  }
}

module.exports = Guild;
