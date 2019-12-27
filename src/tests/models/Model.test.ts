import { UserFactory } from '../factories/UserFactory';
import { User } from '../../models/User';

describe('#findAll', () => {
  it('retrieves all users', async () => {
    const user1 = await UserFactory.persist();
    const user2 = await UserFactory.persist();

    const users = await User.findAll();

    expect(users).toContainEqual(user1);
    expect(users).toContainEqual(user2);
  });
});

describe('#findOne', () => {
  it('retrieves a user', async () => {
    const user1 = await UserFactory.persist();
    await UserFactory.persist();

    const queriedUser = await User.findById(user1._id.toString());

    expect(queriedUser).toEqual(user1);
  });
});

describe('#create', () => {
  it('create a user', async () => {
    const userData = await UserFactory.new();

    const createdUser = await User.create(userData);

    expect(createdUser).toEqual(userData);
  });
});

describe('#update', () => {
  it('updates a user', async () => {
    const user = await UserFactory.persist();
    const userData = await UserFactory.new({ role: 'supplier' });

    await user.update({
      email: userData.email,
      role: userData.role,
      password: userData.password,
    });
    const updatedUser = await User.findById(user._id.toString());

    expect(updatedUser.email).toEqual(userData.email);
    expect(updatedUser.role).toEqual('supplier');
    expect(updatedUser.password).toEqual(userData.password);
  });
});

describe('#delete', () => {
  it('deletes a user', async () => {
    const user = await UserFactory.persist();

    await user.delete();
    const users = await User.findAll({ _id: user._id });

    expect(users).toEqual([]);
  });
});
