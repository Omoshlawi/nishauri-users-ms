import { Account, PatientProfile, Person, Prisma, User } from "@prisma/client";

import { isEmpty } from "lodash";
import { NotFoundException, ValidationException } from "../../../shared/types";
import { UserModel } from "../models";
import { AccountModel } from "../../auth/models";

/**
 * Common Interfacefor ineracting with datasource to manage user, authenticate and authorize
 */

class UserRepository {
  selectFields: Prisma.UserSelect = {
    id: true,
    username: true,
    password: true,
    accounts: {
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    accountVerified: true,
    isActive: true,
    profileUpdated: true,
    person: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        phoneNumber: true,
        dateOfBirth: true,
        constituency: true,
        county: true,
        image: true,
        maritalStatus: true,
        primaryLanguage: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    patientProfile: {
      select: {
        id: true,
        allergies: true,
        bloodGroup: true,
        chronics: true,
        disabilities: true,
        educationLevel: true,
        height: true,
        weight: true,
        occupation: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  };
  /**
   * creates user if no other user with unique fields like phoneNumber, email or username dont exist
   * @param entity User information sed to create new user
   * @returns {User} object
   * @throws {ValidationException} if user with unique field found
   */
  async create(
    entity: Partial<User> & { email?: string; phoneNumber?: string }
  ): Promise<User> {
    const errors: any = {};
    if (entity.username && (await this.exists({ username: entity.username })))
      errors["username"] = { _errors: ["Username taken"] };
    if (
      entity.email &&
      (await this.exists({ person: { email: entity.email } }))
    )
      errors["email"] = { _errors: ["Email taken"] };
    if (
      entity.phoneNumber &&
      (await this.exists({ person: { phoneNumber: entity.phoneNumber } }))
    )
      errors["phoneNumber"] = { _errors: ["Username taken"] }; //Shape error to match zod formated validation error
    if (!isEmpty(errors)) throw { status: 400, errors }; //If errors object has properties then throw exeption
    return await UserModel.create({
      data: {
        username: entity.username,
        password: entity.password,
        person: {
          create: { phoneNumber: entity.phoneNumber, email: entity.email },
        },
      },
      select: this.selectFields,
    });
  }
  /**
   * Finds user with specified id
   * @param id User unique id
   * @throws {NotFoundException}
   * @returns {User} user object
   */
  async findOneById(id: string): Promise<User> {
    const user = await UserModel.findFirst({
      where: { id },
      select: this.selectFields,
    });
    if (!user) throw { status: 404, errors: { detail: "User not found" } };
    return user;
  }
  /**
   * Findes user by account using account id or combination of fields provider and providerAccountId which is a unique combination(compound key)
   * Mostly use full in oauth
   * @param account Account Object used to search user
   * @returns {User} if does exist else null
   */
  async findByAccount(account: Account): Promise<User | null> {
    return await UserModel.findFirst({
      where: {
        accounts: {
          some: {
            OR: [
              {
                id: account.id,
              },
              {
                type: account.type,
                providerAccountId: account.providerAccountId,
              },
            ],
          },
        },
      },
      select: this.selectFields,
    });
  }
  /**
   * Links a user to account if not already linked
   * @param account Account bject to be linked wuth user object
   * @param user User object to be linked wuth account object
   * @returns {boolean} true if linkage successfull or link already existed otherwise false
   * @todo Complee the linkage
   */
  async linkAccount(user: User, account: Account): Promise<boolean> {
    const user_ = await this.findByAccount(account);
    // Link if no link exist for he account
    if (!user_ || user.id !== user_.id) {
      await AccountModel.update({
        where: { id: account.id },
        data: { userId: user.id },
      });
      return true;
    }
    // check if already linked and return true
    if (user.id === user_.id) {
      return true;
    }
    return false;
  }
  /**
   * Checks if User object matching creatiria exists
   * @param where Condition used to evalute user existnce
   * @returns {boolean} true if exist else false
   */
  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    const user = await UserModel.findFirst({ where });
    return user ? true : false;
  }
  async findOne(where: Prisma.UserWhereInput): Promise<User | null> {
    const user = await UserModel.findFirst({
      where,
      select: this.selectFields,
    });
    return user;
  }
  async findAll(): Promise<User[]> {
    return await UserModel.findMany({ select: this.selectFields });
  }
  async findByCriteria(criteria: Prisma.UserWhereInput): Promise<User[]> {
    return await UserModel.findMany({
      where: criteria,
      select: this.selectFields,
    });
  }
  /**
   * updates user if no other user with unique fields like phoneNumber, email or username dont exist
   * @param id - user to update its information
   * @param updates user information to be updated
   * @throws {ValidationException}
   * @returns updated user
   */
  async updateById(
    id: string,
    updates: Partial<User> &
      Partial<Person> &
      Partial<PatientProfile> & {
        allergies?: string[];
        disabilities?: string[];
        chronics?: string[];
      }
  ): Promise<User> {
    const currUser = await this.findOneById(id);
    const errors: any = {};
    if (updates.username) {
      const newUser = await UserModel.findFirst({
        where: {
          AND: [
            { username: updates.username },
            { id: { not: { equals: currUser.id } } }, // Exclude the user being updated
          ],
        },
      });
      if (newUser) errors["username"] = { _errors: ["Username taken"] };
    }
    if (updates.email) {
      const newUser = await UserModel.findFirst({
        where: {
          AND: [
            { person: { email: updates.email } },
            { id: { not: { equals: currUser.id } } }, // Exclude the user being updated
          ],
        },
      });
      if (newUser) errors["email"] = { _errors: ["Email taken"] };
    }
    if (updates.phoneNumber) {
      const newUser = await UserModel.findFirst({
        where: {
          AND: [
            { person: { phoneNumber: updates.phoneNumber } },
            { id: { not: { equals: currUser.id } } },
          ],
        },
      });
      if (newUser) errors["phoneNumber"] = { _errors: ["Phone number taken"] };
    }
    if (!isEmpty(errors)) throw { status: 400, errors };
    const {
      constituency,
      county,
      dateOfBirth,
      email,
      firstName,
      gender,
      image,
      lastName,
      maritalStatus,
      phoneNumber,
      primaryLanguage,
      username,
      allergies,
      bloodGroup,
      chronics,
      disabilities,
      educationLevel,
      height,
      occupation,
      weight,
    } = updates;
    return (await UserModel.update({
      where: { id },
      select: this.selectFields,
      data: {
        username,
        profileUpdated: true,
        person: {
          update: {
            firstName,
            lastName,
            constituency,
            county,
            dateOfBirth,
            email,
            gender,
            image,
            maritalStatus,
            phoneNumber,
            primaryLanguage,
          },
        },
        patientProfile: {
          upsert: {
            where: {
              user: {
                OR: [
                  { username },
                  {
                    person: {
                      OR: [{ email }, { phoneNumber }],
                    },
                  },
                ],
              },
            },
            update: {
              allergies: {
                deleteMany: {
                  allergy: { notIn: allergies },
                },
                createMany: {
                  data: allergies?.map((allergy) => ({ allergy })) ?? [],
                  skipDuplicates: true,
                },
              },
              chronics: {
                deleteMany: {
                  chronicIllness: { notIn: chronics },
                },
                createMany: {
                  data:
                    chronics?.map((chronicIllness) => ({ chronicIllness })) ??
                    [],
                  skipDuplicates: true,
                },
              },
              disabilities: {
                deleteMany: {
                  disability: { notIn: disabilities },
                },
                createMany: {
                  data:
                    disabilities?.map((disability) => ({ disability })) ?? [],
                },
              },
              bloodGroup,
              educationLevel,
              height,
              occupation,
              weight,
            },
            create: {
              allergies: {
                createMany: {
                  data: allergies?.map((allergy) => ({ allergy })) ?? [],
                  skipDuplicates: true,
                },
              },
              chronics: {
                createMany: {
                  data:
                    chronics?.map((chronicIllness) => ({ chronicIllness })) ??
                    [],
                  skipDuplicates: true,
                },
              },
              disabilities: {
                createMany: {
                  data:
                    disabilities?.map((disability) => ({ disability })) ?? [],
                  skipDuplicates: true,
                },
              },
              // allergies,
              bloodGroup,
              // chronics,
              // disabilities,
              educationLevel,
              height,
              occupation,
              weight,
            },
          },
        },
      },
    }))!;
  }
  async deleteById(id: string): Promise<User> {
    return await UserModel.delete({ where: { id } });
  }
}

export default UserRepository;
