export default (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    name: DataTypes.STRING,
    public: { type: DataTypes.BOOLEAN, defaultValue: false }
    // type: { type: DataTypes.STRING, defaultValue: group channel }
  });

  Channel.associate = models => {
    // 1:M
    Channel.belongsTo(models.Team, {
      foreignKey: {
        name: 'teamId',
        field: 'team_id'
      }
    });
    // N:M
    Channel.belongsToMany(models.User, {
      through: 'channel_members',
      foreignKey: {
        name: 'channelId',
        field: 'channel_id'
      }
    });
  };

  return Channel;
};
