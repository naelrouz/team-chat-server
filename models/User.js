import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isAlphanumeric: {
            args: true,
            msg: 'NOT_ALPHANUMERIC'
          },
          len: {
            args: [2, 25],
            msg: 'LENGHT:MIN=2_MAX=100'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: 'INVALID_EMAIL'
          }
        }
      },
      //
      password: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [6, 100],
            msg: 'LENGHT:   MIN=6_MAX=100'
          }
        }
      }
    },
    {
      hooks: {
        afterValidate: async user => {
          const hashedPassword = await bcrypt.hash(user.password, 12);
          // eslint-disable-next-line no-param-reassign
          user.password = hashedPassword;
        }
      }
    }
  );

  User.associate = models => {
    User.belongsToMany(models.Team, {
      through: 'member',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });
    // N:M
    User.belongsToMany(models.Team, {
      through: 'channel_member',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });
  };

  return User;
};
