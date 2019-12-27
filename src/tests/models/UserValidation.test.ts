import { UserFactory } from '../factories/UserFactory';
import { User } from '../../models/User';

describe('#email', () => {
  it('email required on create', async () => {
    const userData = await UserFactory.new();
    userData.email = '';

    try {
      const validationErrors = await User.create(userData);
      throw new Error('Expected validation error, received none');
    } catch (e) {
      expect(e.message).toBe('Email is required.');
    }
  });

  it('email must be unique on create', async () => {
    const user1 = await UserFactory.persist();

    try {
      await User.create({
        email: user1.email,
        password: '12345678',
        role: 'administrator',
      });
      throw new Error('Expected validation error, received none');
    } catch (e) {
      expect(e.message).toBe('Email has already been taken.');
    }
  });

  it('email not required on update', async () => {
    const user = await UserFactory.persist();

    await user.update({
      password: '12345678',
      role: 'administrator',
    });
    const updatedUser = await User.findById(user._id);

    expect(updatedUser.email).toEqual(user.email);
    expect(updatedUser.password).toEqual('12345678');
    expect(updatedUser.role).toEqual('administrator');
  });

  it('email cant be null on update', async () => {
    const user = await UserFactory.persist();

    try {
      await user.update({
        email: '',
        password: '12345678',
        role: 'administrator',
      });
      throw new Error('Expected validation error, received none');
    } catch (e) {
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.email).toEqual(user.email);
      expect(updatedUser.password).toEqual(user.password);
      expect(updatedUser.role).toEqual(user.role);

      expect(e.message).toEqual('Email is required.');
    }
  });

  it('email must be unique on update', async () => {
    const user1 = await UserFactory.persist();
    const user2 = await UserFactory.persist();

    try {
      await user1.update({
        email: user2.email,
        password: user1.password,
        role: user1.role,
      });
      throw new Error('Expected validation error, received none');
    } catch (e) {
      expect(e.message).toContain('Email has already been taken.');
    }
  });

  it('email can update to current value', async () => {
    const user = await UserFactory.persist();

    await user.update({
      email: user.email,
      password: user.password,
      role: user.role,
    });
    const updatedUser = await User.findById(user._id);

    expect(updatedUser.email).toEqual(user.email);
  });
});
