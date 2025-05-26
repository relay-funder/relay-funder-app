
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Campaign
 * 
 */
export type Campaign = $Result.DefaultSelection<Prisma.$CampaignPayload>
/**
 * Model CampaignImage
 * 
 */
export type CampaignImage = $Result.DefaultSelection<Prisma.$CampaignImagePayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Payment
 * 
 */
export type Payment = $Result.DefaultSelection<Prisma.$PaymentPayload>
/**
 * Model Comment
 * 
 */
export type Comment = $Result.DefaultSelection<Prisma.$CommentPayload>
/**
 * Model CampaignUpdate
 * 
 */
export type CampaignUpdate = $Result.DefaultSelection<Prisma.$CampaignUpdatePayload>
/**
 * Model Round
 * 
 */
export type Round = $Result.DefaultSelection<Prisma.$RoundPayload>
/**
 * Model RoundCampaigns
 * 
 */
export type RoundCampaigns = $Result.DefaultSelection<Prisma.$RoundCampaignsPayload>
/**
 * Model Collection
 * 
 */
export type Collection = $Result.DefaultSelection<Prisma.$CollectionPayload>
/**
 * Model CampaignCollection
 * 
 */
export type CampaignCollection = $Result.DefaultSelection<Prisma.$CampaignCollectionPayload>
/**
 * Model Favorite
 * 
 */
export type Favorite = $Result.DefaultSelection<Prisma.$FavoritePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CampaignStatus: {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus]


export const RecipientStatus: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export type RecipientStatus = (typeof RecipientStatus)[keyof typeof RecipientStatus]

}

export type CampaignStatus = $Enums.CampaignStatus

export const CampaignStatus: typeof $Enums.CampaignStatus

export type RecipientStatus = $Enums.RecipientStatus

export const RecipientStatus: typeof $Enums.RecipientStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Campaigns
 * const campaigns = await prisma.campaign.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Campaigns
   * const campaigns = await prisma.campaign.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.campaign`: Exposes CRUD operations for the **Campaign** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Campaigns
    * const campaigns = await prisma.campaign.findMany()
    * ```
    */
  get campaign(): Prisma.CampaignDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.campaignImage`: Exposes CRUD operations for the **CampaignImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CampaignImages
    * const campaignImages = await prisma.campaignImage.findMany()
    * ```
    */
  get campaignImage(): Prisma.CampaignImageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.payment`: Exposes CRUD operations for the **Payment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Payments
    * const payments = await prisma.payment.findMany()
    * ```
    */
  get payment(): Prisma.PaymentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.comment`: Exposes CRUD operations for the **Comment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Comments
    * const comments = await prisma.comment.findMany()
    * ```
    */
  get comment(): Prisma.CommentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.campaignUpdate`: Exposes CRUD operations for the **CampaignUpdate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CampaignUpdates
    * const campaignUpdates = await prisma.campaignUpdate.findMany()
    * ```
    */
  get campaignUpdate(): Prisma.CampaignUpdateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.round`: Exposes CRUD operations for the **Round** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rounds
    * const rounds = await prisma.round.findMany()
    * ```
    */
  get round(): Prisma.RoundDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.roundCampaigns`: Exposes CRUD operations for the **RoundCampaigns** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RoundCampaigns
    * const roundCampaigns = await prisma.roundCampaigns.findMany()
    * ```
    */
  get roundCampaigns(): Prisma.RoundCampaignsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.collection`: Exposes CRUD operations for the **Collection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Collections
    * const collections = await prisma.collection.findMany()
    * ```
    */
  get collection(): Prisma.CollectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.campaignCollection`: Exposes CRUD operations for the **CampaignCollection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CampaignCollections
    * const campaignCollections = await prisma.campaignCollection.findMany()
    * ```
    */
  get campaignCollection(): Prisma.CampaignCollectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.favorite`: Exposes CRUD operations for the **Favorite** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Favorites
    * const favorites = await prisma.favorite.findMany()
    * ```
    */
  get favorite(): Prisma.FavoriteDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Campaign: 'Campaign',
    CampaignImage: 'CampaignImage',
    User: 'User',
    Payment: 'Payment',
    Comment: 'Comment',
    CampaignUpdate: 'CampaignUpdate',
    Round: 'Round',
    RoundCampaigns: 'RoundCampaigns',
    Collection: 'Collection',
    CampaignCollection: 'CampaignCollection',
    Favorite: 'Favorite'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "campaign" | "campaignImage" | "user" | "payment" | "comment" | "campaignUpdate" | "round" | "roundCampaigns" | "collection" | "campaignCollection" | "favorite"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Campaign: {
        payload: Prisma.$CampaignPayload<ExtArgs>
        fields: Prisma.CampaignFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CampaignFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CampaignFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          findFirst: {
            args: Prisma.CampaignFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CampaignFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          findMany: {
            args: Prisma.CampaignFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>[]
          }
          create: {
            args: Prisma.CampaignCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          createMany: {
            args: Prisma.CampaignCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CampaignCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>[]
          }
          delete: {
            args: Prisma.CampaignDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          update: {
            args: Prisma.CampaignUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          deleteMany: {
            args: Prisma.CampaignDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CampaignUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CampaignUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>[]
          }
          upsert: {
            args: Prisma.CampaignUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          aggregate: {
            args: Prisma.CampaignAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCampaign>
          }
          groupBy: {
            args: Prisma.CampaignGroupByArgs<ExtArgs>
            result: $Utils.Optional<CampaignGroupByOutputType>[]
          }
          count: {
            args: Prisma.CampaignCountArgs<ExtArgs>
            result: $Utils.Optional<CampaignCountAggregateOutputType> | number
          }
        }
      }
      CampaignImage: {
        payload: Prisma.$CampaignImagePayload<ExtArgs>
        fields: Prisma.CampaignImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CampaignImageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CampaignImageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>
          }
          findFirst: {
            args: Prisma.CampaignImageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CampaignImageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>
          }
          findMany: {
            args: Prisma.CampaignImageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>[]
          }
          create: {
            args: Prisma.CampaignImageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>
          }
          createMany: {
            args: Prisma.CampaignImageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CampaignImageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>[]
          }
          delete: {
            args: Prisma.CampaignImageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>
          }
          update: {
            args: Prisma.CampaignImageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>
          }
          deleteMany: {
            args: Prisma.CampaignImageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CampaignImageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CampaignImageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>[]
          }
          upsert: {
            args: Prisma.CampaignImageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignImagePayload>
          }
          aggregate: {
            args: Prisma.CampaignImageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCampaignImage>
          }
          groupBy: {
            args: Prisma.CampaignImageGroupByArgs<ExtArgs>
            result: $Utils.Optional<CampaignImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.CampaignImageCountArgs<ExtArgs>
            result: $Utils.Optional<CampaignImageCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Payment: {
        payload: Prisma.$PaymentPayload<ExtArgs>
        fields: Prisma.PaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findFirst: {
            args: Prisma.PaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findMany: {
            args: Prisma.PaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          create: {
            args: Prisma.PaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          createMany: {
            args: Prisma.PaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          delete: {
            args: Prisma.PaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          update: {
            args: Prisma.PaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          deleteMany: {
            args: Prisma.PaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          upsert: {
            args: Prisma.PaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          aggregate: {
            args: Prisma.PaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePayment>
          }
          groupBy: {
            args: Prisma.PaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaymentCountArgs<ExtArgs>
            result: $Utils.Optional<PaymentCountAggregateOutputType> | number
          }
        }
      }
      Comment: {
        payload: Prisma.$CommentPayload<ExtArgs>
        fields: Prisma.CommentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CommentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CommentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findFirst: {
            args: Prisma.CommentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CommentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findMany: {
            args: Prisma.CommentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          create: {
            args: Prisma.CommentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          createMany: {
            args: Prisma.CommentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CommentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          delete: {
            args: Prisma.CommentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          update: {
            args: Prisma.CommentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          deleteMany: {
            args: Prisma.CommentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CommentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CommentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          upsert: {
            args: Prisma.CommentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          aggregate: {
            args: Prisma.CommentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComment>
          }
          groupBy: {
            args: Prisma.CommentGroupByArgs<ExtArgs>
            result: $Utils.Optional<CommentGroupByOutputType>[]
          }
          count: {
            args: Prisma.CommentCountArgs<ExtArgs>
            result: $Utils.Optional<CommentCountAggregateOutputType> | number
          }
        }
      }
      CampaignUpdate: {
        payload: Prisma.$CampaignUpdatePayload<ExtArgs>
        fields: Prisma.CampaignUpdateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CampaignUpdateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CampaignUpdateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>
          }
          findFirst: {
            args: Prisma.CampaignUpdateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CampaignUpdateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>
          }
          findMany: {
            args: Prisma.CampaignUpdateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>[]
          }
          create: {
            args: Prisma.CampaignUpdateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>
          }
          createMany: {
            args: Prisma.CampaignUpdateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CampaignUpdateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>[]
          }
          delete: {
            args: Prisma.CampaignUpdateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>
          }
          update: {
            args: Prisma.CampaignUpdateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>
          }
          deleteMany: {
            args: Prisma.CampaignUpdateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CampaignUpdateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CampaignUpdateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>[]
          }
          upsert: {
            args: Prisma.CampaignUpdateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignUpdatePayload>
          }
          aggregate: {
            args: Prisma.CampaignUpdateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCampaignUpdate>
          }
          groupBy: {
            args: Prisma.CampaignUpdateGroupByArgs<ExtArgs>
            result: $Utils.Optional<CampaignUpdateGroupByOutputType>[]
          }
          count: {
            args: Prisma.CampaignUpdateCountArgs<ExtArgs>
            result: $Utils.Optional<CampaignUpdateCountAggregateOutputType> | number
          }
        }
      }
      Round: {
        payload: Prisma.$RoundPayload<ExtArgs>
        fields: Prisma.RoundFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoundFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoundFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>
          }
          findFirst: {
            args: Prisma.RoundFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoundFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>
          }
          findMany: {
            args: Prisma.RoundFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>[]
          }
          create: {
            args: Prisma.RoundCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>
          }
          createMany: {
            args: Prisma.RoundCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoundCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>[]
          }
          delete: {
            args: Prisma.RoundDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>
          }
          update: {
            args: Prisma.RoundUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>
          }
          deleteMany: {
            args: Prisma.RoundDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoundUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoundUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>[]
          }
          upsert: {
            args: Prisma.RoundUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundPayload>
          }
          aggregate: {
            args: Prisma.RoundAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRound>
          }
          groupBy: {
            args: Prisma.RoundGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoundGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoundCountArgs<ExtArgs>
            result: $Utils.Optional<RoundCountAggregateOutputType> | number
          }
        }
      }
      RoundCampaigns: {
        payload: Prisma.$RoundCampaignsPayload<ExtArgs>
        fields: Prisma.RoundCampaignsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoundCampaignsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoundCampaignsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>
          }
          findFirst: {
            args: Prisma.RoundCampaignsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoundCampaignsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>
          }
          findMany: {
            args: Prisma.RoundCampaignsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>[]
          }
          create: {
            args: Prisma.RoundCampaignsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>
          }
          createMany: {
            args: Prisma.RoundCampaignsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoundCampaignsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>[]
          }
          delete: {
            args: Prisma.RoundCampaignsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>
          }
          update: {
            args: Prisma.RoundCampaignsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>
          }
          deleteMany: {
            args: Prisma.RoundCampaignsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoundCampaignsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoundCampaignsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>[]
          }
          upsert: {
            args: Prisma.RoundCampaignsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoundCampaignsPayload>
          }
          aggregate: {
            args: Prisma.RoundCampaignsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoundCampaigns>
          }
          groupBy: {
            args: Prisma.RoundCampaignsGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoundCampaignsGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoundCampaignsCountArgs<ExtArgs>
            result: $Utils.Optional<RoundCampaignsCountAggregateOutputType> | number
          }
        }
      }
      Collection: {
        payload: Prisma.$CollectionPayload<ExtArgs>
        fields: Prisma.CollectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CollectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CollectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          findFirst: {
            args: Prisma.CollectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CollectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          findMany: {
            args: Prisma.CollectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>[]
          }
          create: {
            args: Prisma.CollectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          createMany: {
            args: Prisma.CollectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CollectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>[]
          }
          delete: {
            args: Prisma.CollectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          update: {
            args: Prisma.CollectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          deleteMany: {
            args: Prisma.CollectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CollectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CollectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>[]
          }
          upsert: {
            args: Prisma.CollectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollectionPayload>
          }
          aggregate: {
            args: Prisma.CollectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCollection>
          }
          groupBy: {
            args: Prisma.CollectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CollectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CollectionCountArgs<ExtArgs>
            result: $Utils.Optional<CollectionCountAggregateOutputType> | number
          }
        }
      }
      CampaignCollection: {
        payload: Prisma.$CampaignCollectionPayload<ExtArgs>
        fields: Prisma.CampaignCollectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CampaignCollectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CampaignCollectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>
          }
          findFirst: {
            args: Prisma.CampaignCollectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CampaignCollectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>
          }
          findMany: {
            args: Prisma.CampaignCollectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>[]
          }
          create: {
            args: Prisma.CampaignCollectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>
          }
          createMany: {
            args: Prisma.CampaignCollectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CampaignCollectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>[]
          }
          delete: {
            args: Prisma.CampaignCollectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>
          }
          update: {
            args: Prisma.CampaignCollectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>
          }
          deleteMany: {
            args: Prisma.CampaignCollectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CampaignCollectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CampaignCollectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>[]
          }
          upsert: {
            args: Prisma.CampaignCollectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignCollectionPayload>
          }
          aggregate: {
            args: Prisma.CampaignCollectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCampaignCollection>
          }
          groupBy: {
            args: Prisma.CampaignCollectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CampaignCollectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CampaignCollectionCountArgs<ExtArgs>
            result: $Utils.Optional<CampaignCollectionCountAggregateOutputType> | number
          }
        }
      }
      Favorite: {
        payload: Prisma.$FavoritePayload<ExtArgs>
        fields: Prisma.FavoriteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FavoriteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FavoriteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>
          }
          findFirst: {
            args: Prisma.FavoriteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FavoriteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>
          }
          findMany: {
            args: Prisma.FavoriteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>[]
          }
          create: {
            args: Prisma.FavoriteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>
          }
          createMany: {
            args: Prisma.FavoriteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FavoriteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>[]
          }
          delete: {
            args: Prisma.FavoriteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>
          }
          update: {
            args: Prisma.FavoriteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>
          }
          deleteMany: {
            args: Prisma.FavoriteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FavoriteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FavoriteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>[]
          }
          upsert: {
            args: Prisma.FavoriteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FavoritePayload>
          }
          aggregate: {
            args: Prisma.FavoriteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFavorite>
          }
          groupBy: {
            args: Prisma.FavoriteGroupByArgs<ExtArgs>
            result: $Utils.Optional<FavoriteGroupByOutputType>[]
          }
          count: {
            args: Prisma.FavoriteCountArgs<ExtArgs>
            result: $Utils.Optional<FavoriteCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    campaign?: CampaignOmit
    campaignImage?: CampaignImageOmit
    user?: UserOmit
    payment?: PaymentOmit
    comment?: CommentOmit
    campaignUpdate?: CampaignUpdateOmit
    round?: RoundOmit
    roundCampaigns?: RoundCampaignsOmit
    collection?: CollectionOmit
    campaignCollection?: CampaignCollectionOmit
    favorite?: FavoriteOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CampaignCountOutputType
   */

  export type CampaignCountOutputType = {
    images: number
    updates: number
    comments: number
    payments: number
    RoundCampaigns: number
    collections: number
    favorites: number
  }

  export type CampaignCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    images?: boolean | CampaignCountOutputTypeCountImagesArgs
    updates?: boolean | CampaignCountOutputTypeCountUpdatesArgs
    comments?: boolean | CampaignCountOutputTypeCountCommentsArgs
    payments?: boolean | CampaignCountOutputTypeCountPaymentsArgs
    RoundCampaigns?: boolean | CampaignCountOutputTypeCountRoundCampaignsArgs
    collections?: boolean | CampaignCountOutputTypeCountCollectionsArgs
    favorites?: boolean | CampaignCountOutputTypeCountFavoritesArgs
  }

  // Custom InputTypes
  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCountOutputType
     */
    select?: CampaignCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeCountImagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignImageWhereInput
  }

  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeCountUpdatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignUpdateWhereInput
  }

  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeCountCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
  }

  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeCountRoundCampaignsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoundCampaignsWhereInput
  }

  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeCountCollectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignCollectionWhereInput
  }

  /**
   * CampaignCountOutputType without action
   */
  export type CampaignCountOutputTypeCountFavoritesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FavoriteWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    payments: number
    collections: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    payments?: boolean | UserCountOutputTypeCountPaymentsArgs
    collections?: boolean | UserCountOutputTypeCountCollectionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCollectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CollectionWhereInput
  }


  /**
   * Count Type RoundCountOutputType
   */

  export type RoundCountOutputType = {
    roundCampaigns: number
  }

  export type RoundCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roundCampaigns?: boolean | RoundCountOutputTypeCountRoundCampaignsArgs
  }

  // Custom InputTypes
  /**
   * RoundCountOutputType without action
   */
  export type RoundCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCountOutputType
     */
    select?: RoundCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RoundCountOutputType without action
   */
  export type RoundCountOutputTypeCountRoundCampaignsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoundCampaignsWhereInput
  }


  /**
   * Count Type CollectionCountOutputType
   */

  export type CollectionCountOutputType = {
    campaigns: number
  }

  export type CollectionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaigns?: boolean | CollectionCountOutputTypeCountCampaignsArgs
  }

  // Custom InputTypes
  /**
   * CollectionCountOutputType without action
   */
  export type CollectionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CollectionCountOutputType
     */
    select?: CollectionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CollectionCountOutputType without action
   */
  export type CollectionCountOutputTypeCountCampaignsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignCollectionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Campaign
   */

  export type AggregateCampaign = {
    _count: CampaignCountAggregateOutputType | null
    _avg: CampaignAvgAggregateOutputType | null
    _sum: CampaignSumAggregateOutputType | null
    _min: CampaignMinAggregateOutputType | null
    _max: CampaignMaxAggregateOutputType | null
  }

  export type CampaignAvgAggregateOutputType = {
    id: number | null
  }

  export type CampaignSumAggregateOutputType = {
    id: number | null
  }

  export type CampaignMinAggregateOutputType = {
    id: number | null
    title: string | null
    description: string | null
    fundingGoal: string | null
    startTime: Date | null
    endTime: Date | null
    creatorAddress: string | null
    status: $Enums.CampaignStatus | null
    transactionHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignAddress: string | null
    slug: string | null
    location: string | null
    treasuryAddress: string | null
    category: string | null
  }

  export type CampaignMaxAggregateOutputType = {
    id: number | null
    title: string | null
    description: string | null
    fundingGoal: string | null
    startTime: Date | null
    endTime: Date | null
    creatorAddress: string | null
    status: $Enums.CampaignStatus | null
    transactionHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignAddress: string | null
    slug: string | null
    location: string | null
    treasuryAddress: string | null
    category: string | null
  }

  export type CampaignCountAggregateOutputType = {
    id: number
    title: number
    description: number
    fundingGoal: number
    startTime: number
    endTime: number
    creatorAddress: number
    status: number
    transactionHash: number
    createdAt: number
    updatedAt: number
    campaignAddress: number
    slug: number
    location: number
    treasuryAddress: number
    category: number
    _all: number
  }


  export type CampaignAvgAggregateInputType = {
    id?: true
  }

  export type CampaignSumAggregateInputType = {
    id?: true
  }

  export type CampaignMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    fundingGoal?: true
    startTime?: true
    endTime?: true
    creatorAddress?: true
    status?: true
    transactionHash?: true
    createdAt?: true
    updatedAt?: true
    campaignAddress?: true
    slug?: true
    location?: true
    treasuryAddress?: true
    category?: true
  }

  export type CampaignMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    fundingGoal?: true
    startTime?: true
    endTime?: true
    creatorAddress?: true
    status?: true
    transactionHash?: true
    createdAt?: true
    updatedAt?: true
    campaignAddress?: true
    slug?: true
    location?: true
    treasuryAddress?: true
    category?: true
  }

  export type CampaignCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    fundingGoal?: true
    startTime?: true
    endTime?: true
    creatorAddress?: true
    status?: true
    transactionHash?: true
    createdAt?: true
    updatedAt?: true
    campaignAddress?: true
    slug?: true
    location?: true
    treasuryAddress?: true
    category?: true
    _all?: true
  }

  export type CampaignAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Campaign to aggregate.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Campaigns
    **/
    _count?: true | CampaignCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CampaignAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CampaignSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CampaignMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CampaignMaxAggregateInputType
  }

  export type GetCampaignAggregateType<T extends CampaignAggregateArgs> = {
        [P in keyof T & keyof AggregateCampaign]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCampaign[P]>
      : GetScalarType<T[P], AggregateCampaign[P]>
  }




  export type CampaignGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignWhereInput
    orderBy?: CampaignOrderByWithAggregationInput | CampaignOrderByWithAggregationInput[]
    by: CampaignScalarFieldEnum[] | CampaignScalarFieldEnum
    having?: CampaignScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CampaignCountAggregateInputType | true
    _avg?: CampaignAvgAggregateInputType
    _sum?: CampaignSumAggregateInputType
    _min?: CampaignMinAggregateInputType
    _max?: CampaignMaxAggregateInputType
  }

  export type CampaignGroupByOutputType = {
    id: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date
    endTime: Date
    creatorAddress: string
    status: $Enums.CampaignStatus
    transactionHash: string | null
    createdAt: Date
    updatedAt: Date
    campaignAddress: string | null
    slug: string
    location: string | null
    treasuryAddress: string | null
    category: string | null
    _count: CampaignCountAggregateOutputType | null
    _avg: CampaignAvgAggregateOutputType | null
    _sum: CampaignSumAggregateOutputType | null
    _min: CampaignMinAggregateOutputType | null
    _max: CampaignMaxAggregateOutputType | null
  }

  type GetCampaignGroupByPayload<T extends CampaignGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CampaignGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CampaignGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CampaignGroupByOutputType[P]>
            : GetScalarType<T[P], CampaignGroupByOutputType[P]>
        }
      >
    >


  export type CampaignSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    fundingGoal?: boolean
    startTime?: boolean
    endTime?: boolean
    creatorAddress?: boolean
    status?: boolean
    transactionHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignAddress?: boolean
    slug?: boolean
    location?: boolean
    treasuryAddress?: boolean
    category?: boolean
    images?: boolean | Campaign$imagesArgs<ExtArgs>
    updates?: boolean | Campaign$updatesArgs<ExtArgs>
    comments?: boolean | Campaign$commentsArgs<ExtArgs>
    payments?: boolean | Campaign$paymentsArgs<ExtArgs>
    RoundCampaigns?: boolean | Campaign$RoundCampaignsArgs<ExtArgs>
    collections?: boolean | Campaign$collectionsArgs<ExtArgs>
    favorites?: boolean | Campaign$favoritesArgs<ExtArgs>
    _count?: boolean | CampaignCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaign"]>

  export type CampaignSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    fundingGoal?: boolean
    startTime?: boolean
    endTime?: boolean
    creatorAddress?: boolean
    status?: boolean
    transactionHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignAddress?: boolean
    slug?: boolean
    location?: boolean
    treasuryAddress?: boolean
    category?: boolean
  }, ExtArgs["result"]["campaign"]>

  export type CampaignSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    fundingGoal?: boolean
    startTime?: boolean
    endTime?: boolean
    creatorAddress?: boolean
    status?: boolean
    transactionHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignAddress?: boolean
    slug?: boolean
    location?: boolean
    treasuryAddress?: boolean
    category?: boolean
  }, ExtArgs["result"]["campaign"]>

  export type CampaignSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    fundingGoal?: boolean
    startTime?: boolean
    endTime?: boolean
    creatorAddress?: boolean
    status?: boolean
    transactionHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignAddress?: boolean
    slug?: boolean
    location?: boolean
    treasuryAddress?: boolean
    category?: boolean
  }

  export type CampaignOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "fundingGoal" | "startTime" | "endTime" | "creatorAddress" | "status" | "transactionHash" | "createdAt" | "updatedAt" | "campaignAddress" | "slug" | "location" | "treasuryAddress" | "category", ExtArgs["result"]["campaign"]>
  export type CampaignInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    images?: boolean | Campaign$imagesArgs<ExtArgs>
    updates?: boolean | Campaign$updatesArgs<ExtArgs>
    comments?: boolean | Campaign$commentsArgs<ExtArgs>
    payments?: boolean | Campaign$paymentsArgs<ExtArgs>
    RoundCampaigns?: boolean | Campaign$RoundCampaignsArgs<ExtArgs>
    collections?: boolean | Campaign$collectionsArgs<ExtArgs>
    favorites?: boolean | Campaign$favoritesArgs<ExtArgs>
    _count?: boolean | CampaignCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CampaignIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CampaignIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CampaignPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Campaign"
    objects: {
      images: Prisma.$CampaignImagePayload<ExtArgs>[]
      updates: Prisma.$CampaignUpdatePayload<ExtArgs>[]
      comments: Prisma.$CommentPayload<ExtArgs>[]
      payments: Prisma.$PaymentPayload<ExtArgs>[]
      RoundCampaigns: Prisma.$RoundCampaignsPayload<ExtArgs>[]
      collections: Prisma.$CampaignCollectionPayload<ExtArgs>[]
      favorites: Prisma.$FavoritePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      title: string
      description: string
      fundingGoal: string
      startTime: Date
      endTime: Date
      creatorAddress: string
      status: $Enums.CampaignStatus
      transactionHash: string | null
      createdAt: Date
      updatedAt: Date
      campaignAddress: string | null
      slug: string
      location: string | null
      treasuryAddress: string | null
      category: string | null
    }, ExtArgs["result"]["campaign"]>
    composites: {}
  }

  type CampaignGetPayload<S extends boolean | null | undefined | CampaignDefaultArgs> = $Result.GetResult<Prisma.$CampaignPayload, S>

  type CampaignCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CampaignFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CampaignCountAggregateInputType | true
    }

  export interface CampaignDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Campaign'], meta: { name: 'Campaign' } }
    /**
     * Find zero or one Campaign that matches the filter.
     * @param {CampaignFindUniqueArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CampaignFindUniqueArgs>(args: SelectSubset<T, CampaignFindUniqueArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Campaign that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CampaignFindUniqueOrThrowArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CampaignFindUniqueOrThrowArgs>(args: SelectSubset<T, CampaignFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Campaign that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignFindFirstArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CampaignFindFirstArgs>(args?: SelectSubset<T, CampaignFindFirstArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Campaign that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignFindFirstOrThrowArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CampaignFindFirstOrThrowArgs>(args?: SelectSubset<T, CampaignFindFirstOrThrowArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Campaigns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Campaigns
     * const campaigns = await prisma.campaign.findMany()
     * 
     * // Get first 10 Campaigns
     * const campaigns = await prisma.campaign.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const campaignWithIdOnly = await prisma.campaign.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CampaignFindManyArgs>(args?: SelectSubset<T, CampaignFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Campaign.
     * @param {CampaignCreateArgs} args - Arguments to create a Campaign.
     * @example
     * // Create one Campaign
     * const Campaign = await prisma.campaign.create({
     *   data: {
     *     // ... data to create a Campaign
     *   }
     * })
     * 
     */
    create<T extends CampaignCreateArgs>(args: SelectSubset<T, CampaignCreateArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Campaigns.
     * @param {CampaignCreateManyArgs} args - Arguments to create many Campaigns.
     * @example
     * // Create many Campaigns
     * const campaign = await prisma.campaign.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CampaignCreateManyArgs>(args?: SelectSubset<T, CampaignCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Campaigns and returns the data saved in the database.
     * @param {CampaignCreateManyAndReturnArgs} args - Arguments to create many Campaigns.
     * @example
     * // Create many Campaigns
     * const campaign = await prisma.campaign.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Campaigns and only return the `id`
     * const campaignWithIdOnly = await prisma.campaign.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CampaignCreateManyAndReturnArgs>(args?: SelectSubset<T, CampaignCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Campaign.
     * @param {CampaignDeleteArgs} args - Arguments to delete one Campaign.
     * @example
     * // Delete one Campaign
     * const Campaign = await prisma.campaign.delete({
     *   where: {
     *     // ... filter to delete one Campaign
     *   }
     * })
     * 
     */
    delete<T extends CampaignDeleteArgs>(args: SelectSubset<T, CampaignDeleteArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Campaign.
     * @param {CampaignUpdateArgs} args - Arguments to update one Campaign.
     * @example
     * // Update one Campaign
     * const campaign = await prisma.campaign.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CampaignUpdateArgs>(args: SelectSubset<T, CampaignUpdateArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Campaigns.
     * @param {CampaignDeleteManyArgs} args - Arguments to filter Campaigns to delete.
     * @example
     * // Delete a few Campaigns
     * const { count } = await prisma.campaign.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CampaignDeleteManyArgs>(args?: SelectSubset<T, CampaignDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Campaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Campaigns
     * const campaign = await prisma.campaign.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CampaignUpdateManyArgs>(args: SelectSubset<T, CampaignUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Campaigns and returns the data updated in the database.
     * @param {CampaignUpdateManyAndReturnArgs} args - Arguments to update many Campaigns.
     * @example
     * // Update many Campaigns
     * const campaign = await prisma.campaign.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Campaigns and only return the `id`
     * const campaignWithIdOnly = await prisma.campaign.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CampaignUpdateManyAndReturnArgs>(args: SelectSubset<T, CampaignUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Campaign.
     * @param {CampaignUpsertArgs} args - Arguments to update or create a Campaign.
     * @example
     * // Update or create a Campaign
     * const campaign = await prisma.campaign.upsert({
     *   create: {
     *     // ... data to create a Campaign
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Campaign we want to update
     *   }
     * })
     */
    upsert<T extends CampaignUpsertArgs>(args: SelectSubset<T, CampaignUpsertArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Campaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCountArgs} args - Arguments to filter Campaigns to count.
     * @example
     * // Count the number of Campaigns
     * const count = await prisma.campaign.count({
     *   where: {
     *     // ... the filter for the Campaigns we want to count
     *   }
     * })
    **/
    count<T extends CampaignCountArgs>(
      args?: Subset<T, CampaignCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CampaignCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Campaign.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CampaignAggregateArgs>(args: Subset<T, CampaignAggregateArgs>): Prisma.PrismaPromise<GetCampaignAggregateType<T>>

    /**
     * Group by Campaign.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CampaignGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CampaignGroupByArgs['orderBy'] }
        : { orderBy?: CampaignGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CampaignGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCampaignGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Campaign model
   */
  readonly fields: CampaignFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Campaign.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CampaignClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    images<T extends Campaign$imagesArgs<ExtArgs> = {}>(args?: Subset<T, Campaign$imagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    updates<T extends Campaign$updatesArgs<ExtArgs> = {}>(args?: Subset<T, Campaign$updatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    comments<T extends Campaign$commentsArgs<ExtArgs> = {}>(args?: Subset<T, Campaign$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    payments<T extends Campaign$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, Campaign$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    RoundCampaigns<T extends Campaign$RoundCampaignsArgs<ExtArgs> = {}>(args?: Subset<T, Campaign$RoundCampaignsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    collections<T extends Campaign$collectionsArgs<ExtArgs> = {}>(args?: Subset<T, Campaign$collectionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    favorites<T extends Campaign$favoritesArgs<ExtArgs> = {}>(args?: Subset<T, Campaign$favoritesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Campaign model
   */
  interface CampaignFieldRefs {
    readonly id: FieldRef<"Campaign", 'Int'>
    readonly title: FieldRef<"Campaign", 'String'>
    readonly description: FieldRef<"Campaign", 'String'>
    readonly fundingGoal: FieldRef<"Campaign", 'String'>
    readonly startTime: FieldRef<"Campaign", 'DateTime'>
    readonly endTime: FieldRef<"Campaign", 'DateTime'>
    readonly creatorAddress: FieldRef<"Campaign", 'String'>
    readonly status: FieldRef<"Campaign", 'CampaignStatus'>
    readonly transactionHash: FieldRef<"Campaign", 'String'>
    readonly createdAt: FieldRef<"Campaign", 'DateTime'>
    readonly updatedAt: FieldRef<"Campaign", 'DateTime'>
    readonly campaignAddress: FieldRef<"Campaign", 'String'>
    readonly slug: FieldRef<"Campaign", 'String'>
    readonly location: FieldRef<"Campaign", 'String'>
    readonly treasuryAddress: FieldRef<"Campaign", 'String'>
    readonly category: FieldRef<"Campaign", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Campaign findUnique
   */
  export type CampaignFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign findUniqueOrThrow
   */
  export type CampaignFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign findFirst
   */
  export type CampaignFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Campaigns.
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Campaigns.
     */
    distinct?: CampaignScalarFieldEnum | CampaignScalarFieldEnum[]
  }

  /**
   * Campaign findFirstOrThrow
   */
  export type CampaignFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Campaigns.
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Campaigns.
     */
    distinct?: CampaignScalarFieldEnum | CampaignScalarFieldEnum[]
  }

  /**
   * Campaign findMany
   */
  export type CampaignFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * Filter, which Campaigns to fetch.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Campaigns.
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    distinct?: CampaignScalarFieldEnum | CampaignScalarFieldEnum[]
  }

  /**
   * Campaign create
   */
  export type CampaignCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * The data needed to create a Campaign.
     */
    data: XOR<CampaignCreateInput, CampaignUncheckedCreateInput>
  }

  /**
   * Campaign createMany
   */
  export type CampaignCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Campaigns.
     */
    data: CampaignCreateManyInput | CampaignCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Campaign createManyAndReturn
   */
  export type CampaignCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * The data used to create many Campaigns.
     */
    data: CampaignCreateManyInput | CampaignCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Campaign update
   */
  export type CampaignUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * The data needed to update a Campaign.
     */
    data: XOR<CampaignUpdateInput, CampaignUncheckedUpdateInput>
    /**
     * Choose, which Campaign to update.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign updateMany
   */
  export type CampaignUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Campaigns.
     */
    data: XOR<CampaignUpdateManyMutationInput, CampaignUncheckedUpdateManyInput>
    /**
     * Filter which Campaigns to update
     */
    where?: CampaignWhereInput
    /**
     * Limit how many Campaigns to update.
     */
    limit?: number
  }

  /**
   * Campaign updateManyAndReturn
   */
  export type CampaignUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * The data used to update Campaigns.
     */
    data: XOR<CampaignUpdateManyMutationInput, CampaignUncheckedUpdateManyInput>
    /**
     * Filter which Campaigns to update
     */
    where?: CampaignWhereInput
    /**
     * Limit how many Campaigns to update.
     */
    limit?: number
  }

  /**
   * Campaign upsert
   */
  export type CampaignUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * The filter to search for the Campaign to update in case it exists.
     */
    where: CampaignWhereUniqueInput
    /**
     * In case the Campaign found by the `where` argument doesn't exist, create a new Campaign with this data.
     */
    create: XOR<CampaignCreateInput, CampaignUncheckedCreateInput>
    /**
     * In case the Campaign was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CampaignUpdateInput, CampaignUncheckedUpdateInput>
  }

  /**
   * Campaign delete
   */
  export type CampaignDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
    /**
     * Filter which Campaign to delete.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign deleteMany
   */
  export type CampaignDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Campaigns to delete
     */
    where?: CampaignWhereInput
    /**
     * Limit how many Campaigns to delete.
     */
    limit?: number
  }

  /**
   * Campaign.images
   */
  export type Campaign$imagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    where?: CampaignImageWhereInput
    orderBy?: CampaignImageOrderByWithRelationInput | CampaignImageOrderByWithRelationInput[]
    cursor?: CampaignImageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CampaignImageScalarFieldEnum | CampaignImageScalarFieldEnum[]
  }

  /**
   * Campaign.updates
   */
  export type Campaign$updatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    where?: CampaignUpdateWhereInput
    orderBy?: CampaignUpdateOrderByWithRelationInput | CampaignUpdateOrderByWithRelationInput[]
    cursor?: CampaignUpdateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CampaignUpdateScalarFieldEnum | CampaignUpdateScalarFieldEnum[]
  }

  /**
   * Campaign.comments
   */
  export type Campaign$commentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Campaign.payments
   */
  export type Campaign$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    cursor?: PaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Campaign.RoundCampaigns
   */
  export type Campaign$RoundCampaignsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    where?: RoundCampaignsWhereInput
    orderBy?: RoundCampaignsOrderByWithRelationInput | RoundCampaignsOrderByWithRelationInput[]
    cursor?: RoundCampaignsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoundCampaignsScalarFieldEnum | RoundCampaignsScalarFieldEnum[]
  }

  /**
   * Campaign.collections
   */
  export type Campaign$collectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    where?: CampaignCollectionWhereInput
    orderBy?: CampaignCollectionOrderByWithRelationInput | CampaignCollectionOrderByWithRelationInput[]
    cursor?: CampaignCollectionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CampaignCollectionScalarFieldEnum | CampaignCollectionScalarFieldEnum[]
  }

  /**
   * Campaign.favorites
   */
  export type Campaign$favoritesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    where?: FavoriteWhereInput
    orderBy?: FavoriteOrderByWithRelationInput | FavoriteOrderByWithRelationInput[]
    cursor?: FavoriteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FavoriteScalarFieldEnum | FavoriteScalarFieldEnum[]
  }

  /**
   * Campaign without action
   */
  export type CampaignDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignInclude<ExtArgs> | null
  }


  /**
   * Model CampaignImage
   */

  export type AggregateCampaignImage = {
    _count: CampaignImageCountAggregateOutputType | null
    _avg: CampaignImageAvgAggregateOutputType | null
    _sum: CampaignImageSumAggregateOutputType | null
    _min: CampaignImageMinAggregateOutputType | null
    _max: CampaignImageMaxAggregateOutputType | null
  }

  export type CampaignImageAvgAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type CampaignImageSumAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type CampaignImageMinAggregateOutputType = {
    id: number | null
    imageUrl: string | null
    isMainImage: boolean | null
    campaignId: number | null
  }

  export type CampaignImageMaxAggregateOutputType = {
    id: number | null
    imageUrl: string | null
    isMainImage: boolean | null
    campaignId: number | null
  }

  export type CampaignImageCountAggregateOutputType = {
    id: number
    imageUrl: number
    isMainImage: number
    campaignId: number
    _all: number
  }


  export type CampaignImageAvgAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type CampaignImageSumAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type CampaignImageMinAggregateInputType = {
    id?: true
    imageUrl?: true
    isMainImage?: true
    campaignId?: true
  }

  export type CampaignImageMaxAggregateInputType = {
    id?: true
    imageUrl?: true
    isMainImage?: true
    campaignId?: true
  }

  export type CampaignImageCountAggregateInputType = {
    id?: true
    imageUrl?: true
    isMainImage?: true
    campaignId?: true
    _all?: true
  }

  export type CampaignImageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignImage to aggregate.
     */
    where?: CampaignImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignImages to fetch.
     */
    orderBy?: CampaignImageOrderByWithRelationInput | CampaignImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CampaignImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CampaignImages
    **/
    _count?: true | CampaignImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CampaignImageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CampaignImageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CampaignImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CampaignImageMaxAggregateInputType
  }

  export type GetCampaignImageAggregateType<T extends CampaignImageAggregateArgs> = {
        [P in keyof T & keyof AggregateCampaignImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCampaignImage[P]>
      : GetScalarType<T[P], AggregateCampaignImage[P]>
  }




  export type CampaignImageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignImageWhereInput
    orderBy?: CampaignImageOrderByWithAggregationInput | CampaignImageOrderByWithAggregationInput[]
    by: CampaignImageScalarFieldEnum[] | CampaignImageScalarFieldEnum
    having?: CampaignImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CampaignImageCountAggregateInputType | true
    _avg?: CampaignImageAvgAggregateInputType
    _sum?: CampaignImageSumAggregateInputType
    _min?: CampaignImageMinAggregateInputType
    _max?: CampaignImageMaxAggregateInputType
  }

  export type CampaignImageGroupByOutputType = {
    id: number
    imageUrl: string
    isMainImage: boolean
    campaignId: number
    _count: CampaignImageCountAggregateOutputType | null
    _avg: CampaignImageAvgAggregateOutputType | null
    _sum: CampaignImageSumAggregateOutputType | null
    _min: CampaignImageMinAggregateOutputType | null
    _max: CampaignImageMaxAggregateOutputType | null
  }

  type GetCampaignImageGroupByPayload<T extends CampaignImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CampaignImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CampaignImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CampaignImageGroupByOutputType[P]>
            : GetScalarType<T[P], CampaignImageGroupByOutputType[P]>
        }
      >
    >


  export type CampaignImageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    imageUrl?: boolean
    isMainImage?: boolean
    campaignId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignImage"]>

  export type CampaignImageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    imageUrl?: boolean
    isMainImage?: boolean
    campaignId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignImage"]>

  export type CampaignImageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    imageUrl?: boolean
    isMainImage?: boolean
    campaignId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignImage"]>

  export type CampaignImageSelectScalar = {
    id?: boolean
    imageUrl?: boolean
    isMainImage?: boolean
    campaignId?: boolean
  }

  export type CampaignImageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "imageUrl" | "isMainImage" | "campaignId", ExtArgs["result"]["campaignImage"]>
  export type CampaignImageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type CampaignImageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type CampaignImageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }

  export type $CampaignImagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CampaignImage"
    objects: {
      campaign: Prisma.$CampaignPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      imageUrl: string
      isMainImage: boolean
      campaignId: number
    }, ExtArgs["result"]["campaignImage"]>
    composites: {}
  }

  type CampaignImageGetPayload<S extends boolean | null | undefined | CampaignImageDefaultArgs> = $Result.GetResult<Prisma.$CampaignImagePayload, S>

  type CampaignImageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CampaignImageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CampaignImageCountAggregateInputType | true
    }

  export interface CampaignImageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CampaignImage'], meta: { name: 'CampaignImage' } }
    /**
     * Find zero or one CampaignImage that matches the filter.
     * @param {CampaignImageFindUniqueArgs} args - Arguments to find a CampaignImage
     * @example
     * // Get one CampaignImage
     * const campaignImage = await prisma.campaignImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CampaignImageFindUniqueArgs>(args: SelectSubset<T, CampaignImageFindUniqueArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CampaignImage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CampaignImageFindUniqueOrThrowArgs} args - Arguments to find a CampaignImage
     * @example
     * // Get one CampaignImage
     * const campaignImage = await prisma.campaignImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CampaignImageFindUniqueOrThrowArgs>(args: SelectSubset<T, CampaignImageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CampaignImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignImageFindFirstArgs} args - Arguments to find a CampaignImage
     * @example
     * // Get one CampaignImage
     * const campaignImage = await prisma.campaignImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CampaignImageFindFirstArgs>(args?: SelectSubset<T, CampaignImageFindFirstArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CampaignImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignImageFindFirstOrThrowArgs} args - Arguments to find a CampaignImage
     * @example
     * // Get one CampaignImage
     * const campaignImage = await prisma.campaignImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CampaignImageFindFirstOrThrowArgs>(args?: SelectSubset<T, CampaignImageFindFirstOrThrowArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CampaignImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignImageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CampaignImages
     * const campaignImages = await prisma.campaignImage.findMany()
     * 
     * // Get first 10 CampaignImages
     * const campaignImages = await prisma.campaignImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const campaignImageWithIdOnly = await prisma.campaignImage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CampaignImageFindManyArgs>(args?: SelectSubset<T, CampaignImageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CampaignImage.
     * @param {CampaignImageCreateArgs} args - Arguments to create a CampaignImage.
     * @example
     * // Create one CampaignImage
     * const CampaignImage = await prisma.campaignImage.create({
     *   data: {
     *     // ... data to create a CampaignImage
     *   }
     * })
     * 
     */
    create<T extends CampaignImageCreateArgs>(args: SelectSubset<T, CampaignImageCreateArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CampaignImages.
     * @param {CampaignImageCreateManyArgs} args - Arguments to create many CampaignImages.
     * @example
     * // Create many CampaignImages
     * const campaignImage = await prisma.campaignImage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CampaignImageCreateManyArgs>(args?: SelectSubset<T, CampaignImageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CampaignImages and returns the data saved in the database.
     * @param {CampaignImageCreateManyAndReturnArgs} args - Arguments to create many CampaignImages.
     * @example
     * // Create many CampaignImages
     * const campaignImage = await prisma.campaignImage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CampaignImages and only return the `id`
     * const campaignImageWithIdOnly = await prisma.campaignImage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CampaignImageCreateManyAndReturnArgs>(args?: SelectSubset<T, CampaignImageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CampaignImage.
     * @param {CampaignImageDeleteArgs} args - Arguments to delete one CampaignImage.
     * @example
     * // Delete one CampaignImage
     * const CampaignImage = await prisma.campaignImage.delete({
     *   where: {
     *     // ... filter to delete one CampaignImage
     *   }
     * })
     * 
     */
    delete<T extends CampaignImageDeleteArgs>(args: SelectSubset<T, CampaignImageDeleteArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CampaignImage.
     * @param {CampaignImageUpdateArgs} args - Arguments to update one CampaignImage.
     * @example
     * // Update one CampaignImage
     * const campaignImage = await prisma.campaignImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CampaignImageUpdateArgs>(args: SelectSubset<T, CampaignImageUpdateArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CampaignImages.
     * @param {CampaignImageDeleteManyArgs} args - Arguments to filter CampaignImages to delete.
     * @example
     * // Delete a few CampaignImages
     * const { count } = await prisma.campaignImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CampaignImageDeleteManyArgs>(args?: SelectSubset<T, CampaignImageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CampaignImages
     * const campaignImage = await prisma.campaignImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CampaignImageUpdateManyArgs>(args: SelectSubset<T, CampaignImageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignImages and returns the data updated in the database.
     * @param {CampaignImageUpdateManyAndReturnArgs} args - Arguments to update many CampaignImages.
     * @example
     * // Update many CampaignImages
     * const campaignImage = await prisma.campaignImage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CampaignImages and only return the `id`
     * const campaignImageWithIdOnly = await prisma.campaignImage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CampaignImageUpdateManyAndReturnArgs>(args: SelectSubset<T, CampaignImageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CampaignImage.
     * @param {CampaignImageUpsertArgs} args - Arguments to update or create a CampaignImage.
     * @example
     * // Update or create a CampaignImage
     * const campaignImage = await prisma.campaignImage.upsert({
     *   create: {
     *     // ... data to create a CampaignImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CampaignImage we want to update
     *   }
     * })
     */
    upsert<T extends CampaignImageUpsertArgs>(args: SelectSubset<T, CampaignImageUpsertArgs<ExtArgs>>): Prisma__CampaignImageClient<$Result.GetResult<Prisma.$CampaignImagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CampaignImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignImageCountArgs} args - Arguments to filter CampaignImages to count.
     * @example
     * // Count the number of CampaignImages
     * const count = await prisma.campaignImage.count({
     *   where: {
     *     // ... the filter for the CampaignImages we want to count
     *   }
     * })
    **/
    count<T extends CampaignImageCountArgs>(
      args?: Subset<T, CampaignImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CampaignImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CampaignImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CampaignImageAggregateArgs>(args: Subset<T, CampaignImageAggregateArgs>): Prisma.PrismaPromise<GetCampaignImageAggregateType<T>>

    /**
     * Group by CampaignImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignImageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CampaignImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CampaignImageGroupByArgs['orderBy'] }
        : { orderBy?: CampaignImageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CampaignImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCampaignImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CampaignImage model
   */
  readonly fields: CampaignImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CampaignImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CampaignImageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    campaign<T extends CampaignDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignDefaultArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CampaignImage model
   */
  interface CampaignImageFieldRefs {
    readonly id: FieldRef<"CampaignImage", 'Int'>
    readonly imageUrl: FieldRef<"CampaignImage", 'String'>
    readonly isMainImage: FieldRef<"CampaignImage", 'Boolean'>
    readonly campaignId: FieldRef<"CampaignImage", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CampaignImage findUnique
   */
  export type CampaignImageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * Filter, which CampaignImage to fetch.
     */
    where: CampaignImageWhereUniqueInput
  }

  /**
   * CampaignImage findUniqueOrThrow
   */
  export type CampaignImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * Filter, which CampaignImage to fetch.
     */
    where: CampaignImageWhereUniqueInput
  }

  /**
   * CampaignImage findFirst
   */
  export type CampaignImageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * Filter, which CampaignImage to fetch.
     */
    where?: CampaignImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignImages to fetch.
     */
    orderBy?: CampaignImageOrderByWithRelationInput | CampaignImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignImages.
     */
    cursor?: CampaignImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignImages.
     */
    distinct?: CampaignImageScalarFieldEnum | CampaignImageScalarFieldEnum[]
  }

  /**
   * CampaignImage findFirstOrThrow
   */
  export type CampaignImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * Filter, which CampaignImage to fetch.
     */
    where?: CampaignImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignImages to fetch.
     */
    orderBy?: CampaignImageOrderByWithRelationInput | CampaignImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignImages.
     */
    cursor?: CampaignImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignImages.
     */
    distinct?: CampaignImageScalarFieldEnum | CampaignImageScalarFieldEnum[]
  }

  /**
   * CampaignImage findMany
   */
  export type CampaignImageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * Filter, which CampaignImages to fetch.
     */
    where?: CampaignImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignImages to fetch.
     */
    orderBy?: CampaignImageOrderByWithRelationInput | CampaignImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CampaignImages.
     */
    cursor?: CampaignImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignImages.
     */
    skip?: number
    distinct?: CampaignImageScalarFieldEnum | CampaignImageScalarFieldEnum[]
  }

  /**
   * CampaignImage create
   */
  export type CampaignImageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * The data needed to create a CampaignImage.
     */
    data: XOR<CampaignImageCreateInput, CampaignImageUncheckedCreateInput>
  }

  /**
   * CampaignImage createMany
   */
  export type CampaignImageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CampaignImages.
     */
    data: CampaignImageCreateManyInput | CampaignImageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CampaignImage createManyAndReturn
   */
  export type CampaignImageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * The data used to create many CampaignImages.
     */
    data: CampaignImageCreateManyInput | CampaignImageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CampaignImage update
   */
  export type CampaignImageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * The data needed to update a CampaignImage.
     */
    data: XOR<CampaignImageUpdateInput, CampaignImageUncheckedUpdateInput>
    /**
     * Choose, which CampaignImage to update.
     */
    where: CampaignImageWhereUniqueInput
  }

  /**
   * CampaignImage updateMany
   */
  export type CampaignImageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CampaignImages.
     */
    data: XOR<CampaignImageUpdateManyMutationInput, CampaignImageUncheckedUpdateManyInput>
    /**
     * Filter which CampaignImages to update
     */
    where?: CampaignImageWhereInput
    /**
     * Limit how many CampaignImages to update.
     */
    limit?: number
  }

  /**
   * CampaignImage updateManyAndReturn
   */
  export type CampaignImageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * The data used to update CampaignImages.
     */
    data: XOR<CampaignImageUpdateManyMutationInput, CampaignImageUncheckedUpdateManyInput>
    /**
     * Filter which CampaignImages to update
     */
    where?: CampaignImageWhereInput
    /**
     * Limit how many CampaignImages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CampaignImage upsert
   */
  export type CampaignImageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * The filter to search for the CampaignImage to update in case it exists.
     */
    where: CampaignImageWhereUniqueInput
    /**
     * In case the CampaignImage found by the `where` argument doesn't exist, create a new CampaignImage with this data.
     */
    create: XOR<CampaignImageCreateInput, CampaignImageUncheckedCreateInput>
    /**
     * In case the CampaignImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CampaignImageUpdateInput, CampaignImageUncheckedUpdateInput>
  }

  /**
   * CampaignImage delete
   */
  export type CampaignImageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
    /**
     * Filter which CampaignImage to delete.
     */
    where: CampaignImageWhereUniqueInput
  }

  /**
   * CampaignImage deleteMany
   */
  export type CampaignImageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignImages to delete
     */
    where?: CampaignImageWhereInput
    /**
     * Limit how many CampaignImages to delete.
     */
    limit?: number
  }

  /**
   * CampaignImage without action
   */
  export type CampaignImageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignImage
     */
    select?: CampaignImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignImage
     */
    omit?: CampaignImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignImageInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    address: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    address?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    address: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    payments?: boolean | User$paymentsArgs<ExtArgs>
    collections?: boolean | User$collectionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "address" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    payments?: boolean | User$paymentsArgs<ExtArgs>
    collections?: boolean | User$collectionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      payments: Prisma.$PaymentPayload<ExtArgs>[]
      collections: Prisma.$CollectionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      address: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    payments<T extends User$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, User$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    collections<T extends User$collectionsArgs<ExtArgs> = {}>(args?: Subset<T, User$collectionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly address: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.payments
   */
  export type User$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    cursor?: PaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * User.collections
   */
  export type User$collectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    where?: CollectionWhereInput
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    cursor?: CollectionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Payment
   */

  export type AggregatePayment = {
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  export type PaymentAvgAggregateOutputType = {
    id: number | null
    campaignId: number | null
    userId: number | null
  }

  export type PaymentSumAggregateOutputType = {
    id: number | null
    campaignId: number | null
    userId: number | null
  }

  export type PaymentMinAggregateOutputType = {
    id: number | null
    amount: string | null
    token: string | null
    status: string | null
    transactionHash: string | null
    isAnonymous: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignId: number | null
    userId: number | null
  }

  export type PaymentMaxAggregateOutputType = {
    id: number | null
    amount: string | null
    token: string | null
    status: string | null
    transactionHash: string | null
    isAnonymous: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignId: number | null
    userId: number | null
  }

  export type PaymentCountAggregateOutputType = {
    id: number
    amount: number
    token: number
    status: number
    transactionHash: number
    isAnonymous: number
    createdAt: number
    updatedAt: number
    campaignId: number
    userId: number
    _all: number
  }


  export type PaymentAvgAggregateInputType = {
    id?: true
    campaignId?: true
    userId?: true
  }

  export type PaymentSumAggregateInputType = {
    id?: true
    campaignId?: true
    userId?: true
  }

  export type PaymentMinAggregateInputType = {
    id?: true
    amount?: true
    token?: true
    status?: true
    transactionHash?: true
    isAnonymous?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
    userId?: true
  }

  export type PaymentMaxAggregateInputType = {
    id?: true
    amount?: true
    token?: true
    status?: true
    transactionHash?: true
    isAnonymous?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
    userId?: true
  }

  export type PaymentCountAggregateInputType = {
    id?: true
    amount?: true
    token?: true
    status?: true
    transactionHash?: true
    isAnonymous?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
    userId?: true
    _all?: true
  }

  export type PaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payment to aggregate.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Payments
    **/
    _count?: true | PaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaymentMaxAggregateInputType
  }

  export type GetPaymentAggregateType<T extends PaymentAggregateArgs> = {
        [P in keyof T & keyof AggregatePayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePayment[P]>
      : GetScalarType<T[P], AggregatePayment[P]>
  }




  export type PaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithAggregationInput | PaymentOrderByWithAggregationInput[]
    by: PaymentScalarFieldEnum[] | PaymentScalarFieldEnum
    having?: PaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaymentCountAggregateInputType | true
    _avg?: PaymentAvgAggregateInputType
    _sum?: PaymentSumAggregateInputType
    _min?: PaymentMinAggregateInputType
    _max?: PaymentMaxAggregateInputType
  }

  export type PaymentGroupByOutputType = {
    id: number
    amount: string
    token: string
    status: string
    transactionHash: string | null
    isAnonymous: boolean
    createdAt: Date
    updatedAt: Date
    campaignId: number
    userId: number
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  type GetPaymentGroupByPayload<T extends PaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaymentGroupByOutputType[P]>
            : GetScalarType<T[P], PaymentGroupByOutputType[P]>
        }
      >
    >


  export type PaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    amount?: boolean
    token?: boolean
    status?: boolean
    transactionHash?: boolean
    isAnonymous?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    userId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    amount?: boolean
    token?: boolean
    status?: boolean
    transactionHash?: boolean
    isAnonymous?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    userId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    amount?: boolean
    token?: boolean
    status?: boolean
    transactionHash?: boolean
    isAnonymous?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    userId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectScalar = {
    id?: boolean
    amount?: boolean
    token?: boolean
    status?: boolean
    transactionHash?: boolean
    isAnonymous?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    userId?: boolean
  }

  export type PaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "amount" | "token" | "status" | "transactionHash" | "isAnonymous" | "createdAt" | "updatedAt" | "campaignId" | "userId", ExtArgs["result"]["payment"]>
  export type PaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PaymentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Payment"
    objects: {
      campaign: Prisma.$CampaignPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      amount: string
      token: string
      status: string
      transactionHash: string | null
      isAnonymous: boolean
      createdAt: Date
      updatedAt: Date
      campaignId: number
      userId: number
    }, ExtArgs["result"]["payment"]>
    composites: {}
  }

  type PaymentGetPayload<S extends boolean | null | undefined | PaymentDefaultArgs> = $Result.GetResult<Prisma.$PaymentPayload, S>

  type PaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PaymentCountAggregateInputType | true
    }

  export interface PaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Payment'], meta: { name: 'Payment' } }
    /**
     * Find zero or one Payment that matches the filter.
     * @param {PaymentFindUniqueArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaymentFindUniqueArgs>(args: SelectSubset<T, PaymentFindUniqueArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Payment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PaymentFindUniqueOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, PaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaymentFindFirstArgs>(args?: SelectSubset<T, PaymentFindFirstArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, PaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Payments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Payments
     * const payments = await prisma.payment.findMany()
     * 
     * // Get first 10 Payments
     * const payments = await prisma.payment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const paymentWithIdOnly = await prisma.payment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PaymentFindManyArgs>(args?: SelectSubset<T, PaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Payment.
     * @param {PaymentCreateArgs} args - Arguments to create a Payment.
     * @example
     * // Create one Payment
     * const Payment = await prisma.payment.create({
     *   data: {
     *     // ... data to create a Payment
     *   }
     * })
     * 
     */
    create<T extends PaymentCreateArgs>(args: SelectSubset<T, PaymentCreateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Payments.
     * @param {PaymentCreateManyArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaymentCreateManyArgs>(args?: SelectSubset<T, PaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Payments and returns the data saved in the database.
     * @param {PaymentCreateManyAndReturnArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, PaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Payment.
     * @param {PaymentDeleteArgs} args - Arguments to delete one Payment.
     * @example
     * // Delete one Payment
     * const Payment = await prisma.payment.delete({
     *   where: {
     *     // ... filter to delete one Payment
     *   }
     * })
     * 
     */
    delete<T extends PaymentDeleteArgs>(args: SelectSubset<T, PaymentDeleteArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Payment.
     * @param {PaymentUpdateArgs} args - Arguments to update one Payment.
     * @example
     * // Update one Payment
     * const payment = await prisma.payment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaymentUpdateArgs>(args: SelectSubset<T, PaymentUpdateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Payments.
     * @param {PaymentDeleteManyArgs} args - Arguments to filter Payments to delete.
     * @example
     * // Delete a few Payments
     * const { count } = await prisma.payment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaymentDeleteManyArgs>(args?: SelectSubset<T, PaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaymentUpdateManyArgs>(args: SelectSubset<T, PaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments and returns the data updated in the database.
     * @param {PaymentUpdateManyAndReturnArgs} args - Arguments to update many Payments.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, PaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Payment.
     * @param {PaymentUpsertArgs} args - Arguments to update or create a Payment.
     * @example
     * // Update or create a Payment
     * const payment = await prisma.payment.upsert({
     *   create: {
     *     // ... data to create a Payment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Payment we want to update
     *   }
     * })
     */
    upsert<T extends PaymentUpsertArgs>(args: SelectSubset<T, PaymentUpsertArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentCountArgs} args - Arguments to filter Payments to count.
     * @example
     * // Count the number of Payments
     * const count = await prisma.payment.count({
     *   where: {
     *     // ... the filter for the Payments we want to count
     *   }
     * })
    **/
    count<T extends PaymentCountArgs>(
      args?: Subset<T, PaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PaymentAggregateArgs>(args: Subset<T, PaymentAggregateArgs>): Prisma.PrismaPromise<GetPaymentAggregateType<T>>

    /**
     * Group by Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaymentGroupByArgs['orderBy'] }
        : { orderBy?: PaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Payment model
   */
  readonly fields: PaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Payment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    campaign<T extends CampaignDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignDefaultArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Payment model
   */
  interface PaymentFieldRefs {
    readonly id: FieldRef<"Payment", 'Int'>
    readonly amount: FieldRef<"Payment", 'String'>
    readonly token: FieldRef<"Payment", 'String'>
    readonly status: FieldRef<"Payment", 'String'>
    readonly transactionHash: FieldRef<"Payment", 'String'>
    readonly isAnonymous: FieldRef<"Payment", 'Boolean'>
    readonly createdAt: FieldRef<"Payment", 'DateTime'>
    readonly updatedAt: FieldRef<"Payment", 'DateTime'>
    readonly campaignId: FieldRef<"Payment", 'Int'>
    readonly userId: FieldRef<"Payment", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Payment findUnique
   */
  export type PaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findUniqueOrThrow
   */
  export type PaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findFirst
   */
  export type PaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findFirstOrThrow
   */
  export type PaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findMany
   */
  export type PaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payments to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment create
   */
  export type PaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to create a Payment.
     */
    data: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
  }

  /**
   * Payment createMany
   */
  export type PaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Payment createManyAndReturn
   */
  export type PaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Payment update
   */
  export type PaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to update a Payment.
     */
    data: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
    /**
     * Choose, which Payment to update.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment updateMany
   */
  export type PaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
  }

  /**
   * Payment updateManyAndReturn
   */
  export type PaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Payment upsert
   */
  export type PaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The filter to search for the Payment to update in case it exists.
     */
    where: PaymentWhereUniqueInput
    /**
     * In case the Payment found by the `where` argument doesn't exist, create a new Payment with this data.
     */
    create: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
    /**
     * In case the Payment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
  }

  /**
   * Payment delete
   */
  export type PaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter which Payment to delete.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment deleteMany
   */
  export type PaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payments to delete
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to delete.
     */
    limit?: number
  }

  /**
   * Payment without action
   */
  export type PaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
  }


  /**
   * Model Comment
   */

  export type AggregateComment = {
    _count: CommentCountAggregateOutputType | null
    _avg: CommentAvgAggregateOutputType | null
    _sum: CommentSumAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  export type CommentAvgAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type CommentSumAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type CommentMinAggregateOutputType = {
    id: number | null
    content: string | null
    userAddress: string | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignId: number | null
  }

  export type CommentMaxAggregateOutputType = {
    id: number | null
    content: string | null
    userAddress: string | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignId: number | null
  }

  export type CommentCountAggregateOutputType = {
    id: number
    content: number
    userAddress: number
    createdAt: number
    updatedAt: number
    campaignId: number
    _all: number
  }


  export type CommentAvgAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type CommentSumAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type CommentMinAggregateInputType = {
    id?: true
    content?: true
    userAddress?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
  }

  export type CommentMaxAggregateInputType = {
    id?: true
    content?: true
    userAddress?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
  }

  export type CommentCountAggregateInputType = {
    id?: true
    content?: true
    userAddress?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
    _all?: true
  }

  export type CommentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comment to aggregate.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Comments
    **/
    _count?: true | CommentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CommentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CommentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CommentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CommentMaxAggregateInputType
  }

  export type GetCommentAggregateType<T extends CommentAggregateArgs> = {
        [P in keyof T & keyof AggregateComment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComment[P]>
      : GetScalarType<T[P], AggregateComment[P]>
  }




  export type CommentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithAggregationInput | CommentOrderByWithAggregationInput[]
    by: CommentScalarFieldEnum[] | CommentScalarFieldEnum
    having?: CommentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CommentCountAggregateInputType | true
    _avg?: CommentAvgAggregateInputType
    _sum?: CommentSumAggregateInputType
    _min?: CommentMinAggregateInputType
    _max?: CommentMaxAggregateInputType
  }

  export type CommentGroupByOutputType = {
    id: number
    content: string
    userAddress: string
    createdAt: Date
    updatedAt: Date
    campaignId: number
    _count: CommentCountAggregateOutputType | null
    _avg: CommentAvgAggregateOutputType | null
    _sum: CommentSumAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  type GetCommentGroupByPayload<T extends CommentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CommentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CommentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CommentGroupByOutputType[P]>
            : GetScalarType<T[P], CommentGroupByOutputType[P]>
        }
      >
    >


  export type CommentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    userAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    userAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    userAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectScalar = {
    id?: boolean
    content?: boolean
    userAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
  }

  export type CommentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "content" | "userAddress" | "createdAt" | "updatedAt" | "campaignId", ExtArgs["result"]["comment"]>
  export type CommentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type CommentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type CommentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }

  export type $CommentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Comment"
    objects: {
      campaign: Prisma.$CampaignPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      content: string
      userAddress: string
      createdAt: Date
      updatedAt: Date
      campaignId: number
    }, ExtArgs["result"]["comment"]>
    composites: {}
  }

  type CommentGetPayload<S extends boolean | null | undefined | CommentDefaultArgs> = $Result.GetResult<Prisma.$CommentPayload, S>

  type CommentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CommentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CommentCountAggregateInputType | true
    }

  export interface CommentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Comment'], meta: { name: 'Comment' } }
    /**
     * Find zero or one Comment that matches the filter.
     * @param {CommentFindUniqueArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommentFindUniqueArgs>(args: SelectSubset<T, CommentFindUniqueArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Comment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CommentFindUniqueOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommentFindUniqueOrThrowArgs>(args: SelectSubset<T, CommentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Comment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommentFindFirstArgs>(args?: SelectSubset<T, CommentFindFirstArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Comment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommentFindFirstOrThrowArgs>(args?: SelectSubset<T, CommentFindFirstOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Comments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Comments
     * const comments = await prisma.comment.findMany()
     * 
     * // Get first 10 Comments
     * const comments = await prisma.comment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const commentWithIdOnly = await prisma.comment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CommentFindManyArgs>(args?: SelectSubset<T, CommentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Comment.
     * @param {CommentCreateArgs} args - Arguments to create a Comment.
     * @example
     * // Create one Comment
     * const Comment = await prisma.comment.create({
     *   data: {
     *     // ... data to create a Comment
     *   }
     * })
     * 
     */
    create<T extends CommentCreateArgs>(args: SelectSubset<T, CommentCreateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Comments.
     * @param {CommentCreateManyArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CommentCreateManyArgs>(args?: SelectSubset<T, CommentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Comments and returns the data saved in the database.
     * @param {CommentCreateManyAndReturnArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Comments and only return the `id`
     * const commentWithIdOnly = await prisma.comment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CommentCreateManyAndReturnArgs>(args?: SelectSubset<T, CommentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Comment.
     * @param {CommentDeleteArgs} args - Arguments to delete one Comment.
     * @example
     * // Delete one Comment
     * const Comment = await prisma.comment.delete({
     *   where: {
     *     // ... filter to delete one Comment
     *   }
     * })
     * 
     */
    delete<T extends CommentDeleteArgs>(args: SelectSubset<T, CommentDeleteArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Comment.
     * @param {CommentUpdateArgs} args - Arguments to update one Comment.
     * @example
     * // Update one Comment
     * const comment = await prisma.comment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CommentUpdateArgs>(args: SelectSubset<T, CommentUpdateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Comments.
     * @param {CommentDeleteManyArgs} args - Arguments to filter Comments to delete.
     * @example
     * // Delete a few Comments
     * const { count } = await prisma.comment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CommentDeleteManyArgs>(args?: SelectSubset<T, CommentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Comments
     * const comment = await prisma.comment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CommentUpdateManyArgs>(args: SelectSubset<T, CommentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Comments and returns the data updated in the database.
     * @param {CommentUpdateManyAndReturnArgs} args - Arguments to update many Comments.
     * @example
     * // Update many Comments
     * const comment = await prisma.comment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Comments and only return the `id`
     * const commentWithIdOnly = await prisma.comment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CommentUpdateManyAndReturnArgs>(args: SelectSubset<T, CommentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Comment.
     * @param {CommentUpsertArgs} args - Arguments to update or create a Comment.
     * @example
     * // Update or create a Comment
     * const comment = await prisma.comment.upsert({
     *   create: {
     *     // ... data to create a Comment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Comment we want to update
     *   }
     * })
     */
    upsert<T extends CommentUpsertArgs>(args: SelectSubset<T, CommentUpsertArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentCountArgs} args - Arguments to filter Comments to count.
     * @example
     * // Count the number of Comments
     * const count = await prisma.comment.count({
     *   where: {
     *     // ... the filter for the Comments we want to count
     *   }
     * })
    **/
    count<T extends CommentCountArgs>(
      args?: Subset<T, CommentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CommentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CommentAggregateArgs>(args: Subset<T, CommentAggregateArgs>): Prisma.PrismaPromise<GetCommentAggregateType<T>>

    /**
     * Group by Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CommentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CommentGroupByArgs['orderBy'] }
        : { orderBy?: CommentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CommentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Comment model
   */
  readonly fields: CommentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Comment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CommentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    campaign<T extends CampaignDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignDefaultArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Comment model
   */
  interface CommentFieldRefs {
    readonly id: FieldRef<"Comment", 'Int'>
    readonly content: FieldRef<"Comment", 'String'>
    readonly userAddress: FieldRef<"Comment", 'String'>
    readonly createdAt: FieldRef<"Comment", 'DateTime'>
    readonly updatedAt: FieldRef<"Comment", 'DateTime'>
    readonly campaignId: FieldRef<"Comment", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Comment findUnique
   */
  export type CommentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findUniqueOrThrow
   */
  export type CommentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findFirst
   */
  export type CommentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findFirstOrThrow
   */
  export type CommentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findMany
   */
  export type CommentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comments to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment create
   */
  export type CommentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to create a Comment.
     */
    data: XOR<CommentCreateInput, CommentUncheckedCreateInput>
  }

  /**
   * Comment createMany
   */
  export type CommentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Comment createManyAndReturn
   */
  export type CommentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Comment update
   */
  export type CommentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to update a Comment.
     */
    data: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
    /**
     * Choose, which Comment to update.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment updateMany
   */
  export type CommentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Comments.
     */
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyInput>
    /**
     * Filter which Comments to update
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to update.
     */
    limit?: number
  }

  /**
   * Comment updateManyAndReturn
   */
  export type CommentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * The data used to update Comments.
     */
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyInput>
    /**
     * Filter which Comments to update
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Comment upsert
   */
  export type CommentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The filter to search for the Comment to update in case it exists.
     */
    where: CommentWhereUniqueInput
    /**
     * In case the Comment found by the `where` argument doesn't exist, create a new Comment with this data.
     */
    create: XOR<CommentCreateInput, CommentUncheckedCreateInput>
    /**
     * In case the Comment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
  }

  /**
   * Comment delete
   */
  export type CommentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter which Comment to delete.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment deleteMany
   */
  export type CommentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comments to delete
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to delete.
     */
    limit?: number
  }

  /**
   * Comment without action
   */
  export type CommentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
  }


  /**
   * Model CampaignUpdate
   */

  export type AggregateCampaignUpdate = {
    _count: CampaignUpdateCountAggregateOutputType | null
    _avg: CampaignUpdateAvgAggregateOutputType | null
    _sum: CampaignUpdateSumAggregateOutputType | null
    _min: CampaignUpdateMinAggregateOutputType | null
    _max: CampaignUpdateMaxAggregateOutputType | null
  }

  export type CampaignUpdateAvgAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type CampaignUpdateSumAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type CampaignUpdateMinAggregateOutputType = {
    id: number | null
    title: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignId: number | null
    creatorAddress: string | null
  }

  export type CampaignUpdateMaxAggregateOutputType = {
    id: number | null
    title: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
    campaignId: number | null
    creatorAddress: string | null
  }

  export type CampaignUpdateCountAggregateOutputType = {
    id: number
    title: number
    content: number
    createdAt: number
    updatedAt: number
    campaignId: number
    creatorAddress: number
    _all: number
  }


  export type CampaignUpdateAvgAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type CampaignUpdateSumAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type CampaignUpdateMinAggregateInputType = {
    id?: true
    title?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
    creatorAddress?: true
  }

  export type CampaignUpdateMaxAggregateInputType = {
    id?: true
    title?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
    creatorAddress?: true
  }

  export type CampaignUpdateCountAggregateInputType = {
    id?: true
    title?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    campaignId?: true
    creatorAddress?: true
    _all?: true
  }

  export type CampaignUpdateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignUpdate to aggregate.
     */
    where?: CampaignUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignUpdates to fetch.
     */
    orderBy?: CampaignUpdateOrderByWithRelationInput | CampaignUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CampaignUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignUpdates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CampaignUpdates
    **/
    _count?: true | CampaignUpdateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CampaignUpdateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CampaignUpdateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CampaignUpdateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CampaignUpdateMaxAggregateInputType
  }

  export type GetCampaignUpdateAggregateType<T extends CampaignUpdateAggregateArgs> = {
        [P in keyof T & keyof AggregateCampaignUpdate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCampaignUpdate[P]>
      : GetScalarType<T[P], AggregateCampaignUpdate[P]>
  }




  export type CampaignUpdateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignUpdateWhereInput
    orderBy?: CampaignUpdateOrderByWithAggregationInput | CampaignUpdateOrderByWithAggregationInput[]
    by: CampaignUpdateScalarFieldEnum[] | CampaignUpdateScalarFieldEnum
    having?: CampaignUpdateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CampaignUpdateCountAggregateInputType | true
    _avg?: CampaignUpdateAvgAggregateInputType
    _sum?: CampaignUpdateSumAggregateInputType
    _min?: CampaignUpdateMinAggregateInputType
    _max?: CampaignUpdateMaxAggregateInputType
  }

  export type CampaignUpdateGroupByOutputType = {
    id: number
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    campaignId: number
    creatorAddress: string
    _count: CampaignUpdateCountAggregateOutputType | null
    _avg: CampaignUpdateAvgAggregateOutputType | null
    _sum: CampaignUpdateSumAggregateOutputType | null
    _min: CampaignUpdateMinAggregateOutputType | null
    _max: CampaignUpdateMaxAggregateOutputType | null
  }

  type GetCampaignUpdateGroupByPayload<T extends CampaignUpdateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CampaignUpdateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CampaignUpdateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CampaignUpdateGroupByOutputType[P]>
            : GetScalarType<T[P], CampaignUpdateGroupByOutputType[P]>
        }
      >
    >


  export type CampaignUpdateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    creatorAddress?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignUpdate"]>

  export type CampaignUpdateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    creatorAddress?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignUpdate"]>

  export type CampaignUpdateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    creatorAddress?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignUpdate"]>

  export type CampaignUpdateSelectScalar = {
    id?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    campaignId?: boolean
    creatorAddress?: boolean
  }

  export type CampaignUpdateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "content" | "createdAt" | "updatedAt" | "campaignId" | "creatorAddress", ExtArgs["result"]["campaignUpdate"]>
  export type CampaignUpdateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type CampaignUpdateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type CampaignUpdateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }

  export type $CampaignUpdatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CampaignUpdate"
    objects: {
      campaign: Prisma.$CampaignPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      title: string
      content: string
      createdAt: Date
      updatedAt: Date
      campaignId: number
      creatorAddress: string
    }, ExtArgs["result"]["campaignUpdate"]>
    composites: {}
  }

  type CampaignUpdateGetPayload<S extends boolean | null | undefined | CampaignUpdateDefaultArgs> = $Result.GetResult<Prisma.$CampaignUpdatePayload, S>

  type CampaignUpdateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CampaignUpdateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CampaignUpdateCountAggregateInputType | true
    }

  export interface CampaignUpdateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CampaignUpdate'], meta: { name: 'CampaignUpdate' } }
    /**
     * Find zero or one CampaignUpdate that matches the filter.
     * @param {CampaignUpdateFindUniqueArgs} args - Arguments to find a CampaignUpdate
     * @example
     * // Get one CampaignUpdate
     * const campaignUpdate = await prisma.campaignUpdate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CampaignUpdateFindUniqueArgs>(args: SelectSubset<T, CampaignUpdateFindUniqueArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CampaignUpdate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CampaignUpdateFindUniqueOrThrowArgs} args - Arguments to find a CampaignUpdate
     * @example
     * // Get one CampaignUpdate
     * const campaignUpdate = await prisma.campaignUpdate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CampaignUpdateFindUniqueOrThrowArgs>(args: SelectSubset<T, CampaignUpdateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CampaignUpdate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateFindFirstArgs} args - Arguments to find a CampaignUpdate
     * @example
     * // Get one CampaignUpdate
     * const campaignUpdate = await prisma.campaignUpdate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CampaignUpdateFindFirstArgs>(args?: SelectSubset<T, CampaignUpdateFindFirstArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CampaignUpdate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateFindFirstOrThrowArgs} args - Arguments to find a CampaignUpdate
     * @example
     * // Get one CampaignUpdate
     * const campaignUpdate = await prisma.campaignUpdate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CampaignUpdateFindFirstOrThrowArgs>(args?: SelectSubset<T, CampaignUpdateFindFirstOrThrowArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CampaignUpdates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CampaignUpdates
     * const campaignUpdates = await prisma.campaignUpdate.findMany()
     * 
     * // Get first 10 CampaignUpdates
     * const campaignUpdates = await prisma.campaignUpdate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const campaignUpdateWithIdOnly = await prisma.campaignUpdate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CampaignUpdateFindManyArgs>(args?: SelectSubset<T, CampaignUpdateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CampaignUpdate.
     * @param {CampaignUpdateCreateArgs} args - Arguments to create a CampaignUpdate.
     * @example
     * // Create one CampaignUpdate
     * const CampaignUpdate = await prisma.campaignUpdate.create({
     *   data: {
     *     // ... data to create a CampaignUpdate
     *   }
     * })
     * 
     */
    create<T extends CampaignUpdateCreateArgs>(args: SelectSubset<T, CampaignUpdateCreateArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CampaignUpdates.
     * @param {CampaignUpdateCreateManyArgs} args - Arguments to create many CampaignUpdates.
     * @example
     * // Create many CampaignUpdates
     * const campaignUpdate = await prisma.campaignUpdate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CampaignUpdateCreateManyArgs>(args?: SelectSubset<T, CampaignUpdateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CampaignUpdates and returns the data saved in the database.
     * @param {CampaignUpdateCreateManyAndReturnArgs} args - Arguments to create many CampaignUpdates.
     * @example
     * // Create many CampaignUpdates
     * const campaignUpdate = await prisma.campaignUpdate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CampaignUpdates and only return the `id`
     * const campaignUpdateWithIdOnly = await prisma.campaignUpdate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CampaignUpdateCreateManyAndReturnArgs>(args?: SelectSubset<T, CampaignUpdateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CampaignUpdate.
     * @param {CampaignUpdateDeleteArgs} args - Arguments to delete one CampaignUpdate.
     * @example
     * // Delete one CampaignUpdate
     * const CampaignUpdate = await prisma.campaignUpdate.delete({
     *   where: {
     *     // ... filter to delete one CampaignUpdate
     *   }
     * })
     * 
     */
    delete<T extends CampaignUpdateDeleteArgs>(args: SelectSubset<T, CampaignUpdateDeleteArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CampaignUpdate.
     * @param {CampaignUpdateUpdateArgs} args - Arguments to update one CampaignUpdate.
     * @example
     * // Update one CampaignUpdate
     * const campaignUpdate = await prisma.campaignUpdate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CampaignUpdateUpdateArgs>(args: SelectSubset<T, CampaignUpdateUpdateArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CampaignUpdates.
     * @param {CampaignUpdateDeleteManyArgs} args - Arguments to filter CampaignUpdates to delete.
     * @example
     * // Delete a few CampaignUpdates
     * const { count } = await prisma.campaignUpdate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CampaignUpdateDeleteManyArgs>(args?: SelectSubset<T, CampaignUpdateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignUpdates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CampaignUpdates
     * const campaignUpdate = await prisma.campaignUpdate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CampaignUpdateUpdateManyArgs>(args: SelectSubset<T, CampaignUpdateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignUpdates and returns the data updated in the database.
     * @param {CampaignUpdateUpdateManyAndReturnArgs} args - Arguments to update many CampaignUpdates.
     * @example
     * // Update many CampaignUpdates
     * const campaignUpdate = await prisma.campaignUpdate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CampaignUpdates and only return the `id`
     * const campaignUpdateWithIdOnly = await prisma.campaignUpdate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CampaignUpdateUpdateManyAndReturnArgs>(args: SelectSubset<T, CampaignUpdateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CampaignUpdate.
     * @param {CampaignUpdateUpsertArgs} args - Arguments to update or create a CampaignUpdate.
     * @example
     * // Update or create a CampaignUpdate
     * const campaignUpdate = await prisma.campaignUpdate.upsert({
     *   create: {
     *     // ... data to create a CampaignUpdate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CampaignUpdate we want to update
     *   }
     * })
     */
    upsert<T extends CampaignUpdateUpsertArgs>(args: SelectSubset<T, CampaignUpdateUpsertArgs<ExtArgs>>): Prisma__CampaignUpdateClient<$Result.GetResult<Prisma.$CampaignUpdatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CampaignUpdates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateCountArgs} args - Arguments to filter CampaignUpdates to count.
     * @example
     * // Count the number of CampaignUpdates
     * const count = await prisma.campaignUpdate.count({
     *   where: {
     *     // ... the filter for the CampaignUpdates we want to count
     *   }
     * })
    **/
    count<T extends CampaignUpdateCountArgs>(
      args?: Subset<T, CampaignUpdateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CampaignUpdateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CampaignUpdate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CampaignUpdateAggregateArgs>(args: Subset<T, CampaignUpdateAggregateArgs>): Prisma.PrismaPromise<GetCampaignUpdateAggregateType<T>>

    /**
     * Group by CampaignUpdate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CampaignUpdateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CampaignUpdateGroupByArgs['orderBy'] }
        : { orderBy?: CampaignUpdateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CampaignUpdateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCampaignUpdateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CampaignUpdate model
   */
  readonly fields: CampaignUpdateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CampaignUpdate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CampaignUpdateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    campaign<T extends CampaignDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignDefaultArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CampaignUpdate model
   */
  interface CampaignUpdateFieldRefs {
    readonly id: FieldRef<"CampaignUpdate", 'Int'>
    readonly title: FieldRef<"CampaignUpdate", 'String'>
    readonly content: FieldRef<"CampaignUpdate", 'String'>
    readonly createdAt: FieldRef<"CampaignUpdate", 'DateTime'>
    readonly updatedAt: FieldRef<"CampaignUpdate", 'DateTime'>
    readonly campaignId: FieldRef<"CampaignUpdate", 'Int'>
    readonly creatorAddress: FieldRef<"CampaignUpdate", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CampaignUpdate findUnique
   */
  export type CampaignUpdateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * Filter, which CampaignUpdate to fetch.
     */
    where: CampaignUpdateWhereUniqueInput
  }

  /**
   * CampaignUpdate findUniqueOrThrow
   */
  export type CampaignUpdateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * Filter, which CampaignUpdate to fetch.
     */
    where: CampaignUpdateWhereUniqueInput
  }

  /**
   * CampaignUpdate findFirst
   */
  export type CampaignUpdateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * Filter, which CampaignUpdate to fetch.
     */
    where?: CampaignUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignUpdates to fetch.
     */
    orderBy?: CampaignUpdateOrderByWithRelationInput | CampaignUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignUpdates.
     */
    cursor?: CampaignUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignUpdates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignUpdates.
     */
    distinct?: CampaignUpdateScalarFieldEnum | CampaignUpdateScalarFieldEnum[]
  }

  /**
   * CampaignUpdate findFirstOrThrow
   */
  export type CampaignUpdateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * Filter, which CampaignUpdate to fetch.
     */
    where?: CampaignUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignUpdates to fetch.
     */
    orderBy?: CampaignUpdateOrderByWithRelationInput | CampaignUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignUpdates.
     */
    cursor?: CampaignUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignUpdates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignUpdates.
     */
    distinct?: CampaignUpdateScalarFieldEnum | CampaignUpdateScalarFieldEnum[]
  }

  /**
   * CampaignUpdate findMany
   */
  export type CampaignUpdateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * Filter, which CampaignUpdates to fetch.
     */
    where?: CampaignUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignUpdates to fetch.
     */
    orderBy?: CampaignUpdateOrderByWithRelationInput | CampaignUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CampaignUpdates.
     */
    cursor?: CampaignUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignUpdates.
     */
    skip?: number
    distinct?: CampaignUpdateScalarFieldEnum | CampaignUpdateScalarFieldEnum[]
  }

  /**
   * CampaignUpdate create
   */
  export type CampaignUpdateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * The data needed to create a CampaignUpdate.
     */
    data: XOR<CampaignUpdateCreateInput, CampaignUpdateUncheckedCreateInput>
  }

  /**
   * CampaignUpdate createMany
   */
  export type CampaignUpdateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CampaignUpdates.
     */
    data: CampaignUpdateCreateManyInput | CampaignUpdateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CampaignUpdate createManyAndReturn
   */
  export type CampaignUpdateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * The data used to create many CampaignUpdates.
     */
    data: CampaignUpdateCreateManyInput | CampaignUpdateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CampaignUpdate update
   */
  export type CampaignUpdateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * The data needed to update a CampaignUpdate.
     */
    data: XOR<CampaignUpdateUpdateInput, CampaignUpdateUncheckedUpdateInput>
    /**
     * Choose, which CampaignUpdate to update.
     */
    where: CampaignUpdateWhereUniqueInput
  }

  /**
   * CampaignUpdate updateMany
   */
  export type CampaignUpdateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CampaignUpdates.
     */
    data: XOR<CampaignUpdateUpdateManyMutationInput, CampaignUpdateUncheckedUpdateManyInput>
    /**
     * Filter which CampaignUpdates to update
     */
    where?: CampaignUpdateWhereInput
    /**
     * Limit how many CampaignUpdates to update.
     */
    limit?: number
  }

  /**
   * CampaignUpdate updateManyAndReturn
   */
  export type CampaignUpdateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * The data used to update CampaignUpdates.
     */
    data: XOR<CampaignUpdateUpdateManyMutationInput, CampaignUpdateUncheckedUpdateManyInput>
    /**
     * Filter which CampaignUpdates to update
     */
    where?: CampaignUpdateWhereInput
    /**
     * Limit how many CampaignUpdates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CampaignUpdate upsert
   */
  export type CampaignUpdateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * The filter to search for the CampaignUpdate to update in case it exists.
     */
    where: CampaignUpdateWhereUniqueInput
    /**
     * In case the CampaignUpdate found by the `where` argument doesn't exist, create a new CampaignUpdate with this data.
     */
    create: XOR<CampaignUpdateCreateInput, CampaignUpdateUncheckedCreateInput>
    /**
     * In case the CampaignUpdate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CampaignUpdateUpdateInput, CampaignUpdateUncheckedUpdateInput>
  }

  /**
   * CampaignUpdate delete
   */
  export type CampaignUpdateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
    /**
     * Filter which CampaignUpdate to delete.
     */
    where: CampaignUpdateWhereUniqueInput
  }

  /**
   * CampaignUpdate deleteMany
   */
  export type CampaignUpdateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignUpdates to delete
     */
    where?: CampaignUpdateWhereInput
    /**
     * Limit how many CampaignUpdates to delete.
     */
    limit?: number
  }

  /**
   * CampaignUpdate without action
   */
  export type CampaignUpdateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignUpdate
     */
    select?: CampaignUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignUpdate
     */
    omit?: CampaignUpdateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignUpdateInclude<ExtArgs> | null
  }


  /**
   * Model Round
   */

  export type AggregateRound = {
    _count: RoundCountAggregateOutputType | null
    _avg: RoundAvgAggregateOutputType | null
    _sum: RoundSumAggregateOutputType | null
    _min: RoundMinAggregateOutputType | null
    _max: RoundMaxAggregateOutputType | null
  }

  export type RoundAvgAggregateOutputType = {
    id: number | null
    poolId: number | null
    matchingPool: Decimal | null
    tokenDecimals: number | null
  }

  export type RoundSumAggregateOutputType = {
    id: number | null
    poolId: bigint | null
    matchingPool: Decimal | null
    tokenDecimals: number | null
  }

  export type RoundMinAggregateOutputType = {
    id: number | null
    poolId: bigint | null
    strategyAddress: string | null
    profileId: string | null
    managerAddress: string | null
    transactionHash: string | null
    title: string | null
    description: string | null
    matchingPool: Decimal | null
    tokenAddress: string | null
    tokenDecimals: number | null
    applicationStart: Date | null
    applicationClose: Date | null
    startDate: Date | null
    endDate: Date | null
    blockchain: string | null
    logoUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RoundMaxAggregateOutputType = {
    id: number | null
    poolId: bigint | null
    strategyAddress: string | null
    profileId: string | null
    managerAddress: string | null
    transactionHash: string | null
    title: string | null
    description: string | null
    matchingPool: Decimal | null
    tokenAddress: string | null
    tokenDecimals: number | null
    applicationStart: Date | null
    applicationClose: Date | null
    startDate: Date | null
    endDate: Date | null
    blockchain: string | null
    logoUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RoundCountAggregateOutputType = {
    id: number
    poolId: number
    strategyAddress: number
    profileId: number
    managerAddress: number
    transactionHash: number
    title: number
    description: number
    tags: number
    matchingPool: number
    tokenAddress: number
    tokenDecimals: number
    applicationStart: number
    applicationClose: number
    startDate: number
    endDate: number
    blockchain: number
    logoUrl: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RoundAvgAggregateInputType = {
    id?: true
    poolId?: true
    matchingPool?: true
    tokenDecimals?: true
  }

  export type RoundSumAggregateInputType = {
    id?: true
    poolId?: true
    matchingPool?: true
    tokenDecimals?: true
  }

  export type RoundMinAggregateInputType = {
    id?: true
    poolId?: true
    strategyAddress?: true
    profileId?: true
    managerAddress?: true
    transactionHash?: true
    title?: true
    description?: true
    matchingPool?: true
    tokenAddress?: true
    tokenDecimals?: true
    applicationStart?: true
    applicationClose?: true
    startDate?: true
    endDate?: true
    blockchain?: true
    logoUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RoundMaxAggregateInputType = {
    id?: true
    poolId?: true
    strategyAddress?: true
    profileId?: true
    managerAddress?: true
    transactionHash?: true
    title?: true
    description?: true
    matchingPool?: true
    tokenAddress?: true
    tokenDecimals?: true
    applicationStart?: true
    applicationClose?: true
    startDate?: true
    endDate?: true
    blockchain?: true
    logoUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RoundCountAggregateInputType = {
    id?: true
    poolId?: true
    strategyAddress?: true
    profileId?: true
    managerAddress?: true
    transactionHash?: true
    title?: true
    description?: true
    tags?: true
    matchingPool?: true
    tokenAddress?: true
    tokenDecimals?: true
    applicationStart?: true
    applicationClose?: true
    startDate?: true
    endDate?: true
    blockchain?: true
    logoUrl?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RoundAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Round to aggregate.
     */
    where?: RoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rounds to fetch.
     */
    orderBy?: RoundOrderByWithRelationInput | RoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rounds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rounds
    **/
    _count?: true | RoundCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoundAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoundSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoundMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoundMaxAggregateInputType
  }

  export type GetRoundAggregateType<T extends RoundAggregateArgs> = {
        [P in keyof T & keyof AggregateRound]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRound[P]>
      : GetScalarType<T[P], AggregateRound[P]>
  }




  export type RoundGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoundWhereInput
    orderBy?: RoundOrderByWithAggregationInput | RoundOrderByWithAggregationInput[]
    by: RoundScalarFieldEnum[] | RoundScalarFieldEnum
    having?: RoundScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoundCountAggregateInputType | true
    _avg?: RoundAvgAggregateInputType
    _sum?: RoundSumAggregateInputType
    _min?: RoundMinAggregateInputType
    _max?: RoundMaxAggregateInputType
  }

  export type RoundGroupByOutputType = {
    id: number
    poolId: bigint | null
    strategyAddress: string
    profileId: string
    managerAddress: string
    transactionHash: string | null
    title: string
    description: string
    tags: string[]
    matchingPool: Decimal
    tokenAddress: string
    tokenDecimals: number
    applicationStart: Date
    applicationClose: Date
    startDate: Date
    endDate: Date
    blockchain: string
    logoUrl: string | null
    createdAt: Date
    updatedAt: Date
    _count: RoundCountAggregateOutputType | null
    _avg: RoundAvgAggregateOutputType | null
    _sum: RoundSumAggregateOutputType | null
    _min: RoundMinAggregateOutputType | null
    _max: RoundMaxAggregateOutputType | null
  }

  type GetRoundGroupByPayload<T extends RoundGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoundGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoundGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoundGroupByOutputType[P]>
            : GetScalarType<T[P], RoundGroupByOutputType[P]>
        }
      >
    >


  export type RoundSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolId?: boolean
    strategyAddress?: boolean
    profileId?: boolean
    managerAddress?: boolean
    transactionHash?: boolean
    title?: boolean
    description?: boolean
    tags?: boolean
    matchingPool?: boolean
    tokenAddress?: boolean
    tokenDecimals?: boolean
    applicationStart?: boolean
    applicationClose?: boolean
    startDate?: boolean
    endDate?: boolean
    blockchain?: boolean
    logoUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    roundCampaigns?: boolean | Round$roundCampaignsArgs<ExtArgs>
    _count?: boolean | RoundCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["round"]>

  export type RoundSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolId?: boolean
    strategyAddress?: boolean
    profileId?: boolean
    managerAddress?: boolean
    transactionHash?: boolean
    title?: boolean
    description?: boolean
    tags?: boolean
    matchingPool?: boolean
    tokenAddress?: boolean
    tokenDecimals?: boolean
    applicationStart?: boolean
    applicationClose?: boolean
    startDate?: boolean
    endDate?: boolean
    blockchain?: boolean
    logoUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["round"]>

  export type RoundSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolId?: boolean
    strategyAddress?: boolean
    profileId?: boolean
    managerAddress?: boolean
    transactionHash?: boolean
    title?: boolean
    description?: boolean
    tags?: boolean
    matchingPool?: boolean
    tokenAddress?: boolean
    tokenDecimals?: boolean
    applicationStart?: boolean
    applicationClose?: boolean
    startDate?: boolean
    endDate?: boolean
    blockchain?: boolean
    logoUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["round"]>

  export type RoundSelectScalar = {
    id?: boolean
    poolId?: boolean
    strategyAddress?: boolean
    profileId?: boolean
    managerAddress?: boolean
    transactionHash?: boolean
    title?: boolean
    description?: boolean
    tags?: boolean
    matchingPool?: boolean
    tokenAddress?: boolean
    tokenDecimals?: boolean
    applicationStart?: boolean
    applicationClose?: boolean
    startDate?: boolean
    endDate?: boolean
    blockchain?: boolean
    logoUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RoundOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "poolId" | "strategyAddress" | "profileId" | "managerAddress" | "transactionHash" | "title" | "description" | "tags" | "matchingPool" | "tokenAddress" | "tokenDecimals" | "applicationStart" | "applicationClose" | "startDate" | "endDate" | "blockchain" | "logoUrl" | "createdAt" | "updatedAt", ExtArgs["result"]["round"]>
  export type RoundInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roundCampaigns?: boolean | Round$roundCampaignsArgs<ExtArgs>
    _count?: boolean | RoundCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RoundIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RoundIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RoundPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Round"
    objects: {
      roundCampaigns: Prisma.$RoundCampaignsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      poolId: bigint | null
      strategyAddress: string
      profileId: string
      managerAddress: string
      transactionHash: string | null
      title: string
      description: string
      tags: string[]
      matchingPool: Prisma.Decimal
      tokenAddress: string
      tokenDecimals: number
      applicationStart: Date
      applicationClose: Date
      startDate: Date
      endDate: Date
      blockchain: string
      logoUrl: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["round"]>
    composites: {}
  }

  type RoundGetPayload<S extends boolean | null | undefined | RoundDefaultArgs> = $Result.GetResult<Prisma.$RoundPayload, S>

  type RoundCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoundFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoundCountAggregateInputType | true
    }

  export interface RoundDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Round'], meta: { name: 'Round' } }
    /**
     * Find zero or one Round that matches the filter.
     * @param {RoundFindUniqueArgs} args - Arguments to find a Round
     * @example
     * // Get one Round
     * const round = await prisma.round.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoundFindUniqueArgs>(args: SelectSubset<T, RoundFindUniqueArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Round that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoundFindUniqueOrThrowArgs} args - Arguments to find a Round
     * @example
     * // Get one Round
     * const round = await prisma.round.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoundFindUniqueOrThrowArgs>(args: SelectSubset<T, RoundFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Round that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundFindFirstArgs} args - Arguments to find a Round
     * @example
     * // Get one Round
     * const round = await prisma.round.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoundFindFirstArgs>(args?: SelectSubset<T, RoundFindFirstArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Round that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundFindFirstOrThrowArgs} args - Arguments to find a Round
     * @example
     * // Get one Round
     * const round = await prisma.round.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoundFindFirstOrThrowArgs>(args?: SelectSubset<T, RoundFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rounds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rounds
     * const rounds = await prisma.round.findMany()
     * 
     * // Get first 10 Rounds
     * const rounds = await prisma.round.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roundWithIdOnly = await prisma.round.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoundFindManyArgs>(args?: SelectSubset<T, RoundFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Round.
     * @param {RoundCreateArgs} args - Arguments to create a Round.
     * @example
     * // Create one Round
     * const Round = await prisma.round.create({
     *   data: {
     *     // ... data to create a Round
     *   }
     * })
     * 
     */
    create<T extends RoundCreateArgs>(args: SelectSubset<T, RoundCreateArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rounds.
     * @param {RoundCreateManyArgs} args - Arguments to create many Rounds.
     * @example
     * // Create many Rounds
     * const round = await prisma.round.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoundCreateManyArgs>(args?: SelectSubset<T, RoundCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rounds and returns the data saved in the database.
     * @param {RoundCreateManyAndReturnArgs} args - Arguments to create many Rounds.
     * @example
     * // Create many Rounds
     * const round = await prisma.round.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rounds and only return the `id`
     * const roundWithIdOnly = await prisma.round.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoundCreateManyAndReturnArgs>(args?: SelectSubset<T, RoundCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Round.
     * @param {RoundDeleteArgs} args - Arguments to delete one Round.
     * @example
     * // Delete one Round
     * const Round = await prisma.round.delete({
     *   where: {
     *     // ... filter to delete one Round
     *   }
     * })
     * 
     */
    delete<T extends RoundDeleteArgs>(args: SelectSubset<T, RoundDeleteArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Round.
     * @param {RoundUpdateArgs} args - Arguments to update one Round.
     * @example
     * // Update one Round
     * const round = await prisma.round.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoundUpdateArgs>(args: SelectSubset<T, RoundUpdateArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rounds.
     * @param {RoundDeleteManyArgs} args - Arguments to filter Rounds to delete.
     * @example
     * // Delete a few Rounds
     * const { count } = await prisma.round.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoundDeleteManyArgs>(args?: SelectSubset<T, RoundDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rounds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rounds
     * const round = await prisma.round.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoundUpdateManyArgs>(args: SelectSubset<T, RoundUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rounds and returns the data updated in the database.
     * @param {RoundUpdateManyAndReturnArgs} args - Arguments to update many Rounds.
     * @example
     * // Update many Rounds
     * const round = await prisma.round.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rounds and only return the `id`
     * const roundWithIdOnly = await prisma.round.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoundUpdateManyAndReturnArgs>(args: SelectSubset<T, RoundUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Round.
     * @param {RoundUpsertArgs} args - Arguments to update or create a Round.
     * @example
     * // Update or create a Round
     * const round = await prisma.round.upsert({
     *   create: {
     *     // ... data to create a Round
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Round we want to update
     *   }
     * })
     */
    upsert<T extends RoundUpsertArgs>(args: SelectSubset<T, RoundUpsertArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rounds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCountArgs} args - Arguments to filter Rounds to count.
     * @example
     * // Count the number of Rounds
     * const count = await prisma.round.count({
     *   where: {
     *     // ... the filter for the Rounds we want to count
     *   }
     * })
    **/
    count<T extends RoundCountArgs>(
      args?: Subset<T, RoundCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoundCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Round.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoundAggregateArgs>(args: Subset<T, RoundAggregateArgs>): Prisma.PrismaPromise<GetRoundAggregateType<T>>

    /**
     * Group by Round.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoundGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoundGroupByArgs['orderBy'] }
        : { orderBy?: RoundGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoundGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoundGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Round model
   */
  readonly fields: RoundFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Round.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoundClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    roundCampaigns<T extends Round$roundCampaignsArgs<ExtArgs> = {}>(args?: Subset<T, Round$roundCampaignsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Round model
   */
  interface RoundFieldRefs {
    readonly id: FieldRef<"Round", 'Int'>
    readonly poolId: FieldRef<"Round", 'BigInt'>
    readonly strategyAddress: FieldRef<"Round", 'String'>
    readonly profileId: FieldRef<"Round", 'String'>
    readonly managerAddress: FieldRef<"Round", 'String'>
    readonly transactionHash: FieldRef<"Round", 'String'>
    readonly title: FieldRef<"Round", 'String'>
    readonly description: FieldRef<"Round", 'String'>
    readonly tags: FieldRef<"Round", 'String[]'>
    readonly matchingPool: FieldRef<"Round", 'Decimal'>
    readonly tokenAddress: FieldRef<"Round", 'String'>
    readonly tokenDecimals: FieldRef<"Round", 'Int'>
    readonly applicationStart: FieldRef<"Round", 'DateTime'>
    readonly applicationClose: FieldRef<"Round", 'DateTime'>
    readonly startDate: FieldRef<"Round", 'DateTime'>
    readonly endDate: FieldRef<"Round", 'DateTime'>
    readonly blockchain: FieldRef<"Round", 'String'>
    readonly logoUrl: FieldRef<"Round", 'String'>
    readonly createdAt: FieldRef<"Round", 'DateTime'>
    readonly updatedAt: FieldRef<"Round", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Round findUnique
   */
  export type RoundFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * Filter, which Round to fetch.
     */
    where: RoundWhereUniqueInput
  }

  /**
   * Round findUniqueOrThrow
   */
  export type RoundFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * Filter, which Round to fetch.
     */
    where: RoundWhereUniqueInput
  }

  /**
   * Round findFirst
   */
  export type RoundFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * Filter, which Round to fetch.
     */
    where?: RoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rounds to fetch.
     */
    orderBy?: RoundOrderByWithRelationInput | RoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rounds.
     */
    cursor?: RoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rounds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rounds.
     */
    distinct?: RoundScalarFieldEnum | RoundScalarFieldEnum[]
  }

  /**
   * Round findFirstOrThrow
   */
  export type RoundFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * Filter, which Round to fetch.
     */
    where?: RoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rounds to fetch.
     */
    orderBy?: RoundOrderByWithRelationInput | RoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rounds.
     */
    cursor?: RoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rounds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rounds.
     */
    distinct?: RoundScalarFieldEnum | RoundScalarFieldEnum[]
  }

  /**
   * Round findMany
   */
  export type RoundFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * Filter, which Rounds to fetch.
     */
    where?: RoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rounds to fetch.
     */
    orderBy?: RoundOrderByWithRelationInput | RoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rounds.
     */
    cursor?: RoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rounds.
     */
    skip?: number
    distinct?: RoundScalarFieldEnum | RoundScalarFieldEnum[]
  }

  /**
   * Round create
   */
  export type RoundCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * The data needed to create a Round.
     */
    data: XOR<RoundCreateInput, RoundUncheckedCreateInput>
  }

  /**
   * Round createMany
   */
  export type RoundCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rounds.
     */
    data: RoundCreateManyInput | RoundCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Round createManyAndReturn
   */
  export type RoundCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * The data used to create many Rounds.
     */
    data: RoundCreateManyInput | RoundCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Round update
   */
  export type RoundUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * The data needed to update a Round.
     */
    data: XOR<RoundUpdateInput, RoundUncheckedUpdateInput>
    /**
     * Choose, which Round to update.
     */
    where: RoundWhereUniqueInput
  }

  /**
   * Round updateMany
   */
  export type RoundUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rounds.
     */
    data: XOR<RoundUpdateManyMutationInput, RoundUncheckedUpdateManyInput>
    /**
     * Filter which Rounds to update
     */
    where?: RoundWhereInput
    /**
     * Limit how many Rounds to update.
     */
    limit?: number
  }

  /**
   * Round updateManyAndReturn
   */
  export type RoundUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * The data used to update Rounds.
     */
    data: XOR<RoundUpdateManyMutationInput, RoundUncheckedUpdateManyInput>
    /**
     * Filter which Rounds to update
     */
    where?: RoundWhereInput
    /**
     * Limit how many Rounds to update.
     */
    limit?: number
  }

  /**
   * Round upsert
   */
  export type RoundUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * The filter to search for the Round to update in case it exists.
     */
    where: RoundWhereUniqueInput
    /**
     * In case the Round found by the `where` argument doesn't exist, create a new Round with this data.
     */
    create: XOR<RoundCreateInput, RoundUncheckedCreateInput>
    /**
     * In case the Round was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoundUpdateInput, RoundUncheckedUpdateInput>
  }

  /**
   * Round delete
   */
  export type RoundDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
    /**
     * Filter which Round to delete.
     */
    where: RoundWhereUniqueInput
  }

  /**
   * Round deleteMany
   */
  export type RoundDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rounds to delete
     */
    where?: RoundWhereInput
    /**
     * Limit how many Rounds to delete.
     */
    limit?: number
  }

  /**
   * Round.roundCampaigns
   */
  export type Round$roundCampaignsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    where?: RoundCampaignsWhereInput
    orderBy?: RoundCampaignsOrderByWithRelationInput | RoundCampaignsOrderByWithRelationInput[]
    cursor?: RoundCampaignsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoundCampaignsScalarFieldEnum | RoundCampaignsScalarFieldEnum[]
  }

  /**
   * Round without action
   */
  export type RoundDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Round
     */
    select?: RoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Round
     */
    omit?: RoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundInclude<ExtArgs> | null
  }


  /**
   * Model RoundCampaigns
   */

  export type AggregateRoundCampaigns = {
    _count: RoundCampaignsCountAggregateOutputType | null
    _avg: RoundCampaignsAvgAggregateOutputType | null
    _sum: RoundCampaignsSumAggregateOutputType | null
    _min: RoundCampaignsMinAggregateOutputType | null
    _max: RoundCampaignsMaxAggregateOutputType | null
  }

  export type RoundCampaignsAvgAggregateOutputType = {
    id: number | null
    roundId: number | null
    campaignId: number | null
  }

  export type RoundCampaignsSumAggregateOutputType = {
    id: number | null
    roundId: number | null
    campaignId: number | null
  }

  export type RoundCampaignsMinAggregateOutputType = {
    id: number | null
    roundId: number | null
    campaignId: number | null
    status: $Enums.RecipientStatus | null
    recipientAddress: string | null
    submittedByWalletAddress: string | null
    txHash: string | null
    onchainRecipientId: string | null
    reviewedAt: Date | null
  }

  export type RoundCampaignsMaxAggregateOutputType = {
    id: number | null
    roundId: number | null
    campaignId: number | null
    status: $Enums.RecipientStatus | null
    recipientAddress: string | null
    submittedByWalletAddress: string | null
    txHash: string | null
    onchainRecipientId: string | null
    reviewedAt: Date | null
  }

  export type RoundCampaignsCountAggregateOutputType = {
    id: number
    roundId: number
    campaignId: number
    status: number
    recipientAddress: number
    submittedByWalletAddress: number
    txHash: number
    onchainRecipientId: number
    reviewedAt: number
    _all: number
  }


  export type RoundCampaignsAvgAggregateInputType = {
    id?: true
    roundId?: true
    campaignId?: true
  }

  export type RoundCampaignsSumAggregateInputType = {
    id?: true
    roundId?: true
    campaignId?: true
  }

  export type RoundCampaignsMinAggregateInputType = {
    id?: true
    roundId?: true
    campaignId?: true
    status?: true
    recipientAddress?: true
    submittedByWalletAddress?: true
    txHash?: true
    onchainRecipientId?: true
    reviewedAt?: true
  }

  export type RoundCampaignsMaxAggregateInputType = {
    id?: true
    roundId?: true
    campaignId?: true
    status?: true
    recipientAddress?: true
    submittedByWalletAddress?: true
    txHash?: true
    onchainRecipientId?: true
    reviewedAt?: true
  }

  export type RoundCampaignsCountAggregateInputType = {
    id?: true
    roundId?: true
    campaignId?: true
    status?: true
    recipientAddress?: true
    submittedByWalletAddress?: true
    txHash?: true
    onchainRecipientId?: true
    reviewedAt?: true
    _all?: true
  }

  export type RoundCampaignsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoundCampaigns to aggregate.
     */
    where?: RoundCampaignsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoundCampaigns to fetch.
     */
    orderBy?: RoundCampaignsOrderByWithRelationInput | RoundCampaignsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoundCampaignsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoundCampaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoundCampaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RoundCampaigns
    **/
    _count?: true | RoundCampaignsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoundCampaignsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoundCampaignsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoundCampaignsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoundCampaignsMaxAggregateInputType
  }

  export type GetRoundCampaignsAggregateType<T extends RoundCampaignsAggregateArgs> = {
        [P in keyof T & keyof AggregateRoundCampaigns]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoundCampaigns[P]>
      : GetScalarType<T[P], AggregateRoundCampaigns[P]>
  }




  export type RoundCampaignsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoundCampaignsWhereInput
    orderBy?: RoundCampaignsOrderByWithAggregationInput | RoundCampaignsOrderByWithAggregationInput[]
    by: RoundCampaignsScalarFieldEnum[] | RoundCampaignsScalarFieldEnum
    having?: RoundCampaignsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoundCampaignsCountAggregateInputType | true
    _avg?: RoundCampaignsAvgAggregateInputType
    _sum?: RoundCampaignsSumAggregateInputType
    _min?: RoundCampaignsMinAggregateInputType
    _max?: RoundCampaignsMaxAggregateInputType
  }

  export type RoundCampaignsGroupByOutputType = {
    id: number
    roundId: number
    campaignId: number
    status: $Enums.RecipientStatus
    recipientAddress: string | null
    submittedByWalletAddress: string | null
    txHash: string | null
    onchainRecipientId: string | null
    reviewedAt: Date | null
    _count: RoundCampaignsCountAggregateOutputType | null
    _avg: RoundCampaignsAvgAggregateOutputType | null
    _sum: RoundCampaignsSumAggregateOutputType | null
    _min: RoundCampaignsMinAggregateOutputType | null
    _max: RoundCampaignsMaxAggregateOutputType | null
  }

  type GetRoundCampaignsGroupByPayload<T extends RoundCampaignsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoundCampaignsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoundCampaignsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoundCampaignsGroupByOutputType[P]>
            : GetScalarType<T[P], RoundCampaignsGroupByOutputType[P]>
        }
      >
    >


  export type RoundCampaignsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roundId?: boolean
    campaignId?: boolean
    status?: boolean
    recipientAddress?: boolean
    submittedByWalletAddress?: boolean
    txHash?: boolean
    onchainRecipientId?: boolean
    reviewedAt?: boolean
    Campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    Round?: boolean | RoundDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roundCampaigns"]>

  export type RoundCampaignsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roundId?: boolean
    campaignId?: boolean
    status?: boolean
    recipientAddress?: boolean
    submittedByWalletAddress?: boolean
    txHash?: boolean
    onchainRecipientId?: boolean
    reviewedAt?: boolean
    Campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    Round?: boolean | RoundDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roundCampaigns"]>

  export type RoundCampaignsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roundId?: boolean
    campaignId?: boolean
    status?: boolean
    recipientAddress?: boolean
    submittedByWalletAddress?: boolean
    txHash?: boolean
    onchainRecipientId?: boolean
    reviewedAt?: boolean
    Campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    Round?: boolean | RoundDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roundCampaigns"]>

  export type RoundCampaignsSelectScalar = {
    id?: boolean
    roundId?: boolean
    campaignId?: boolean
    status?: boolean
    recipientAddress?: boolean
    submittedByWalletAddress?: boolean
    txHash?: boolean
    onchainRecipientId?: boolean
    reviewedAt?: boolean
  }

  export type RoundCampaignsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "roundId" | "campaignId" | "status" | "recipientAddress" | "submittedByWalletAddress" | "txHash" | "onchainRecipientId" | "reviewedAt", ExtArgs["result"]["roundCampaigns"]>
  export type RoundCampaignsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    Round?: boolean | RoundDefaultArgs<ExtArgs>
  }
  export type RoundCampaignsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    Round?: boolean | RoundDefaultArgs<ExtArgs>
  }
  export type RoundCampaignsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    Round?: boolean | RoundDefaultArgs<ExtArgs>
  }

  export type $RoundCampaignsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RoundCampaigns"
    objects: {
      Campaign: Prisma.$CampaignPayload<ExtArgs>
      Round: Prisma.$RoundPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      roundId: number
      campaignId: number
      status: $Enums.RecipientStatus
      recipientAddress: string | null
      submittedByWalletAddress: string | null
      txHash: string | null
      onchainRecipientId: string | null
      reviewedAt: Date | null
    }, ExtArgs["result"]["roundCampaigns"]>
    composites: {}
  }

  type RoundCampaignsGetPayload<S extends boolean | null | undefined | RoundCampaignsDefaultArgs> = $Result.GetResult<Prisma.$RoundCampaignsPayload, S>

  type RoundCampaignsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoundCampaignsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoundCampaignsCountAggregateInputType | true
    }

  export interface RoundCampaignsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RoundCampaigns'], meta: { name: 'RoundCampaigns' } }
    /**
     * Find zero or one RoundCampaigns that matches the filter.
     * @param {RoundCampaignsFindUniqueArgs} args - Arguments to find a RoundCampaigns
     * @example
     * // Get one RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoundCampaignsFindUniqueArgs>(args: SelectSubset<T, RoundCampaignsFindUniqueArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RoundCampaigns that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoundCampaignsFindUniqueOrThrowArgs} args - Arguments to find a RoundCampaigns
     * @example
     * // Get one RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoundCampaignsFindUniqueOrThrowArgs>(args: SelectSubset<T, RoundCampaignsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoundCampaigns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCampaignsFindFirstArgs} args - Arguments to find a RoundCampaigns
     * @example
     * // Get one RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoundCampaignsFindFirstArgs>(args?: SelectSubset<T, RoundCampaignsFindFirstArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoundCampaigns that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCampaignsFindFirstOrThrowArgs} args - Arguments to find a RoundCampaigns
     * @example
     * // Get one RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoundCampaignsFindFirstOrThrowArgs>(args?: SelectSubset<T, RoundCampaignsFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RoundCampaigns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCampaignsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.findMany()
     * 
     * // Get first 10 RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roundCampaignsWithIdOnly = await prisma.roundCampaigns.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoundCampaignsFindManyArgs>(args?: SelectSubset<T, RoundCampaignsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RoundCampaigns.
     * @param {RoundCampaignsCreateArgs} args - Arguments to create a RoundCampaigns.
     * @example
     * // Create one RoundCampaigns
     * const RoundCampaigns = await prisma.roundCampaigns.create({
     *   data: {
     *     // ... data to create a RoundCampaigns
     *   }
     * })
     * 
     */
    create<T extends RoundCampaignsCreateArgs>(args: SelectSubset<T, RoundCampaignsCreateArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RoundCampaigns.
     * @param {RoundCampaignsCreateManyArgs} args - Arguments to create many RoundCampaigns.
     * @example
     * // Create many RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoundCampaignsCreateManyArgs>(args?: SelectSubset<T, RoundCampaignsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RoundCampaigns and returns the data saved in the database.
     * @param {RoundCampaignsCreateManyAndReturnArgs} args - Arguments to create many RoundCampaigns.
     * @example
     * // Create many RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RoundCampaigns and only return the `id`
     * const roundCampaignsWithIdOnly = await prisma.roundCampaigns.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoundCampaignsCreateManyAndReturnArgs>(args?: SelectSubset<T, RoundCampaignsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RoundCampaigns.
     * @param {RoundCampaignsDeleteArgs} args - Arguments to delete one RoundCampaigns.
     * @example
     * // Delete one RoundCampaigns
     * const RoundCampaigns = await prisma.roundCampaigns.delete({
     *   where: {
     *     // ... filter to delete one RoundCampaigns
     *   }
     * })
     * 
     */
    delete<T extends RoundCampaignsDeleteArgs>(args: SelectSubset<T, RoundCampaignsDeleteArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RoundCampaigns.
     * @param {RoundCampaignsUpdateArgs} args - Arguments to update one RoundCampaigns.
     * @example
     * // Update one RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoundCampaignsUpdateArgs>(args: SelectSubset<T, RoundCampaignsUpdateArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RoundCampaigns.
     * @param {RoundCampaignsDeleteManyArgs} args - Arguments to filter RoundCampaigns to delete.
     * @example
     * // Delete a few RoundCampaigns
     * const { count } = await prisma.roundCampaigns.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoundCampaignsDeleteManyArgs>(args?: SelectSubset<T, RoundCampaignsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoundCampaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCampaignsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoundCampaignsUpdateManyArgs>(args: SelectSubset<T, RoundCampaignsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoundCampaigns and returns the data updated in the database.
     * @param {RoundCampaignsUpdateManyAndReturnArgs} args - Arguments to update many RoundCampaigns.
     * @example
     * // Update many RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RoundCampaigns and only return the `id`
     * const roundCampaignsWithIdOnly = await prisma.roundCampaigns.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoundCampaignsUpdateManyAndReturnArgs>(args: SelectSubset<T, RoundCampaignsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RoundCampaigns.
     * @param {RoundCampaignsUpsertArgs} args - Arguments to update or create a RoundCampaigns.
     * @example
     * // Update or create a RoundCampaigns
     * const roundCampaigns = await prisma.roundCampaigns.upsert({
     *   create: {
     *     // ... data to create a RoundCampaigns
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RoundCampaigns we want to update
     *   }
     * })
     */
    upsert<T extends RoundCampaignsUpsertArgs>(args: SelectSubset<T, RoundCampaignsUpsertArgs<ExtArgs>>): Prisma__RoundCampaignsClient<$Result.GetResult<Prisma.$RoundCampaignsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RoundCampaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCampaignsCountArgs} args - Arguments to filter RoundCampaigns to count.
     * @example
     * // Count the number of RoundCampaigns
     * const count = await prisma.roundCampaigns.count({
     *   where: {
     *     // ... the filter for the RoundCampaigns we want to count
     *   }
     * })
    **/
    count<T extends RoundCampaignsCountArgs>(
      args?: Subset<T, RoundCampaignsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoundCampaignsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RoundCampaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCampaignsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoundCampaignsAggregateArgs>(args: Subset<T, RoundCampaignsAggregateArgs>): Prisma.PrismaPromise<GetRoundCampaignsAggregateType<T>>

    /**
     * Group by RoundCampaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoundCampaignsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoundCampaignsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoundCampaignsGroupByArgs['orderBy'] }
        : { orderBy?: RoundCampaignsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoundCampaignsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoundCampaignsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RoundCampaigns model
   */
  readonly fields: RoundCampaignsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RoundCampaigns.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoundCampaignsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Campaign<T extends CampaignDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignDefaultArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Round<T extends RoundDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoundDefaultArgs<ExtArgs>>): Prisma__RoundClient<$Result.GetResult<Prisma.$RoundPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RoundCampaigns model
   */
  interface RoundCampaignsFieldRefs {
    readonly id: FieldRef<"RoundCampaigns", 'Int'>
    readonly roundId: FieldRef<"RoundCampaigns", 'Int'>
    readonly campaignId: FieldRef<"RoundCampaigns", 'Int'>
    readonly status: FieldRef<"RoundCampaigns", 'RecipientStatus'>
    readonly recipientAddress: FieldRef<"RoundCampaigns", 'String'>
    readonly submittedByWalletAddress: FieldRef<"RoundCampaigns", 'String'>
    readonly txHash: FieldRef<"RoundCampaigns", 'String'>
    readonly onchainRecipientId: FieldRef<"RoundCampaigns", 'String'>
    readonly reviewedAt: FieldRef<"RoundCampaigns", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RoundCampaigns findUnique
   */
  export type RoundCampaignsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * Filter, which RoundCampaigns to fetch.
     */
    where: RoundCampaignsWhereUniqueInput
  }

  /**
   * RoundCampaigns findUniqueOrThrow
   */
  export type RoundCampaignsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * Filter, which RoundCampaigns to fetch.
     */
    where: RoundCampaignsWhereUniqueInput
  }

  /**
   * RoundCampaigns findFirst
   */
  export type RoundCampaignsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * Filter, which RoundCampaigns to fetch.
     */
    where?: RoundCampaignsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoundCampaigns to fetch.
     */
    orderBy?: RoundCampaignsOrderByWithRelationInput | RoundCampaignsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoundCampaigns.
     */
    cursor?: RoundCampaignsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoundCampaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoundCampaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoundCampaigns.
     */
    distinct?: RoundCampaignsScalarFieldEnum | RoundCampaignsScalarFieldEnum[]
  }

  /**
   * RoundCampaigns findFirstOrThrow
   */
  export type RoundCampaignsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * Filter, which RoundCampaigns to fetch.
     */
    where?: RoundCampaignsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoundCampaigns to fetch.
     */
    orderBy?: RoundCampaignsOrderByWithRelationInput | RoundCampaignsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoundCampaigns.
     */
    cursor?: RoundCampaignsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoundCampaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoundCampaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoundCampaigns.
     */
    distinct?: RoundCampaignsScalarFieldEnum | RoundCampaignsScalarFieldEnum[]
  }

  /**
   * RoundCampaigns findMany
   */
  export type RoundCampaignsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * Filter, which RoundCampaigns to fetch.
     */
    where?: RoundCampaignsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoundCampaigns to fetch.
     */
    orderBy?: RoundCampaignsOrderByWithRelationInput | RoundCampaignsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RoundCampaigns.
     */
    cursor?: RoundCampaignsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoundCampaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoundCampaigns.
     */
    skip?: number
    distinct?: RoundCampaignsScalarFieldEnum | RoundCampaignsScalarFieldEnum[]
  }

  /**
   * RoundCampaigns create
   */
  export type RoundCampaignsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * The data needed to create a RoundCampaigns.
     */
    data: XOR<RoundCampaignsCreateInput, RoundCampaignsUncheckedCreateInput>
  }

  /**
   * RoundCampaigns createMany
   */
  export type RoundCampaignsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RoundCampaigns.
     */
    data: RoundCampaignsCreateManyInput | RoundCampaignsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RoundCampaigns createManyAndReturn
   */
  export type RoundCampaignsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * The data used to create many RoundCampaigns.
     */
    data: RoundCampaignsCreateManyInput | RoundCampaignsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RoundCampaigns update
   */
  export type RoundCampaignsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * The data needed to update a RoundCampaigns.
     */
    data: XOR<RoundCampaignsUpdateInput, RoundCampaignsUncheckedUpdateInput>
    /**
     * Choose, which RoundCampaigns to update.
     */
    where: RoundCampaignsWhereUniqueInput
  }

  /**
   * RoundCampaigns updateMany
   */
  export type RoundCampaignsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RoundCampaigns.
     */
    data: XOR<RoundCampaignsUpdateManyMutationInput, RoundCampaignsUncheckedUpdateManyInput>
    /**
     * Filter which RoundCampaigns to update
     */
    where?: RoundCampaignsWhereInput
    /**
     * Limit how many RoundCampaigns to update.
     */
    limit?: number
  }

  /**
   * RoundCampaigns updateManyAndReturn
   */
  export type RoundCampaignsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * The data used to update RoundCampaigns.
     */
    data: XOR<RoundCampaignsUpdateManyMutationInput, RoundCampaignsUncheckedUpdateManyInput>
    /**
     * Filter which RoundCampaigns to update
     */
    where?: RoundCampaignsWhereInput
    /**
     * Limit how many RoundCampaigns to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RoundCampaigns upsert
   */
  export type RoundCampaignsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * The filter to search for the RoundCampaigns to update in case it exists.
     */
    where: RoundCampaignsWhereUniqueInput
    /**
     * In case the RoundCampaigns found by the `where` argument doesn't exist, create a new RoundCampaigns with this data.
     */
    create: XOR<RoundCampaignsCreateInput, RoundCampaignsUncheckedCreateInput>
    /**
     * In case the RoundCampaigns was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoundCampaignsUpdateInput, RoundCampaignsUncheckedUpdateInput>
  }

  /**
   * RoundCampaigns delete
   */
  export type RoundCampaignsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
    /**
     * Filter which RoundCampaigns to delete.
     */
    where: RoundCampaignsWhereUniqueInput
  }

  /**
   * RoundCampaigns deleteMany
   */
  export type RoundCampaignsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoundCampaigns to delete
     */
    where?: RoundCampaignsWhereInput
    /**
     * Limit how many RoundCampaigns to delete.
     */
    limit?: number
  }

  /**
   * RoundCampaigns without action
   */
  export type RoundCampaignsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoundCampaigns
     */
    select?: RoundCampaignsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoundCampaigns
     */
    omit?: RoundCampaignsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoundCampaignsInclude<ExtArgs> | null
  }


  /**
   * Model Collection
   */

  export type AggregateCollection = {
    _count: CollectionCountAggregateOutputType | null
    _min: CollectionMinAggregateOutputType | null
    _max: CollectionMaxAggregateOutputType | null
  }

  export type CollectionMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type CollectionMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type CollectionCountAggregateOutputType = {
    id: number
    name: number
    description: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type CollectionMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type CollectionMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type CollectionCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type CollectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Collection to aggregate.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Collections
    **/
    _count?: true | CollectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CollectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CollectionMaxAggregateInputType
  }

  export type GetCollectionAggregateType<T extends CollectionAggregateArgs> = {
        [P in keyof T & keyof AggregateCollection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCollection[P]>
      : GetScalarType<T[P], AggregateCollection[P]>
  }




  export type CollectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CollectionWhereInput
    orderBy?: CollectionOrderByWithAggregationInput | CollectionOrderByWithAggregationInput[]
    by: CollectionScalarFieldEnum[] | CollectionScalarFieldEnum
    having?: CollectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CollectionCountAggregateInputType | true
    _min?: CollectionMinAggregateInputType
    _max?: CollectionMaxAggregateInputType
  }

  export type CollectionGroupByOutputType = {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: CollectionCountAggregateOutputType | null
    _min: CollectionMinAggregateOutputType | null
    _max: CollectionMaxAggregateOutputType | null
  }

  type GetCollectionGroupByPayload<T extends CollectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CollectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CollectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CollectionGroupByOutputType[P]>
            : GetScalarType<T[P], CollectionGroupByOutputType[P]>
        }
      >
    >


  export type CollectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    campaigns?: boolean | Collection$campaignsArgs<ExtArgs>
    _count?: boolean | CollectionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["collection"]>

  export type CollectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["collection"]>

  export type CollectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["collection"]>

  export type CollectionSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type CollectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["collection"]>
  export type CollectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    campaigns?: boolean | Collection$campaignsArgs<ExtArgs>
    _count?: boolean | CollectionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CollectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CollectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CollectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Collection"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      campaigns: Prisma.$CampaignCollectionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["collection"]>
    composites: {}
  }

  type CollectionGetPayload<S extends boolean | null | undefined | CollectionDefaultArgs> = $Result.GetResult<Prisma.$CollectionPayload, S>

  type CollectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CollectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CollectionCountAggregateInputType | true
    }

  export interface CollectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Collection'], meta: { name: 'Collection' } }
    /**
     * Find zero or one Collection that matches the filter.
     * @param {CollectionFindUniqueArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CollectionFindUniqueArgs>(args: SelectSubset<T, CollectionFindUniqueArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Collection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CollectionFindUniqueOrThrowArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CollectionFindUniqueOrThrowArgs>(args: SelectSubset<T, CollectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Collection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionFindFirstArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CollectionFindFirstArgs>(args?: SelectSubset<T, CollectionFindFirstArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Collection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionFindFirstOrThrowArgs} args - Arguments to find a Collection
     * @example
     * // Get one Collection
     * const collection = await prisma.collection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CollectionFindFirstOrThrowArgs>(args?: SelectSubset<T, CollectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Collections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Collections
     * const collections = await prisma.collection.findMany()
     * 
     * // Get first 10 Collections
     * const collections = await prisma.collection.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const collectionWithIdOnly = await prisma.collection.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CollectionFindManyArgs>(args?: SelectSubset<T, CollectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Collection.
     * @param {CollectionCreateArgs} args - Arguments to create a Collection.
     * @example
     * // Create one Collection
     * const Collection = await prisma.collection.create({
     *   data: {
     *     // ... data to create a Collection
     *   }
     * })
     * 
     */
    create<T extends CollectionCreateArgs>(args: SelectSubset<T, CollectionCreateArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Collections.
     * @param {CollectionCreateManyArgs} args - Arguments to create many Collections.
     * @example
     * // Create many Collections
     * const collection = await prisma.collection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CollectionCreateManyArgs>(args?: SelectSubset<T, CollectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Collections and returns the data saved in the database.
     * @param {CollectionCreateManyAndReturnArgs} args - Arguments to create many Collections.
     * @example
     * // Create many Collections
     * const collection = await prisma.collection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Collections and only return the `id`
     * const collectionWithIdOnly = await prisma.collection.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CollectionCreateManyAndReturnArgs>(args?: SelectSubset<T, CollectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Collection.
     * @param {CollectionDeleteArgs} args - Arguments to delete one Collection.
     * @example
     * // Delete one Collection
     * const Collection = await prisma.collection.delete({
     *   where: {
     *     // ... filter to delete one Collection
     *   }
     * })
     * 
     */
    delete<T extends CollectionDeleteArgs>(args: SelectSubset<T, CollectionDeleteArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Collection.
     * @param {CollectionUpdateArgs} args - Arguments to update one Collection.
     * @example
     * // Update one Collection
     * const collection = await prisma.collection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CollectionUpdateArgs>(args: SelectSubset<T, CollectionUpdateArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Collections.
     * @param {CollectionDeleteManyArgs} args - Arguments to filter Collections to delete.
     * @example
     * // Delete a few Collections
     * const { count } = await prisma.collection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CollectionDeleteManyArgs>(args?: SelectSubset<T, CollectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Collections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Collections
     * const collection = await prisma.collection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CollectionUpdateManyArgs>(args: SelectSubset<T, CollectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Collections and returns the data updated in the database.
     * @param {CollectionUpdateManyAndReturnArgs} args - Arguments to update many Collections.
     * @example
     * // Update many Collections
     * const collection = await prisma.collection.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Collections and only return the `id`
     * const collectionWithIdOnly = await prisma.collection.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CollectionUpdateManyAndReturnArgs>(args: SelectSubset<T, CollectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Collection.
     * @param {CollectionUpsertArgs} args - Arguments to update or create a Collection.
     * @example
     * // Update or create a Collection
     * const collection = await prisma.collection.upsert({
     *   create: {
     *     // ... data to create a Collection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Collection we want to update
     *   }
     * })
     */
    upsert<T extends CollectionUpsertArgs>(args: SelectSubset<T, CollectionUpsertArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Collections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionCountArgs} args - Arguments to filter Collections to count.
     * @example
     * // Count the number of Collections
     * const count = await prisma.collection.count({
     *   where: {
     *     // ... the filter for the Collections we want to count
     *   }
     * })
    **/
    count<T extends CollectionCountArgs>(
      args?: Subset<T, CollectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CollectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Collection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CollectionAggregateArgs>(args: Subset<T, CollectionAggregateArgs>): Prisma.PrismaPromise<GetCollectionAggregateType<T>>

    /**
     * Group by Collection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollectionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CollectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CollectionGroupByArgs['orderBy'] }
        : { orderBy?: CollectionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CollectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCollectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Collection model
   */
  readonly fields: CollectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Collection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CollectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    campaigns<T extends Collection$campaignsArgs<ExtArgs> = {}>(args?: Subset<T, Collection$campaignsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Collection model
   */
  interface CollectionFieldRefs {
    readonly id: FieldRef<"Collection", 'String'>
    readonly name: FieldRef<"Collection", 'String'>
    readonly description: FieldRef<"Collection", 'String'>
    readonly createdAt: FieldRef<"Collection", 'DateTime'>
    readonly updatedAt: FieldRef<"Collection", 'DateTime'>
    readonly userId: FieldRef<"Collection", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Collection findUnique
   */
  export type CollectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection findUniqueOrThrow
   */
  export type CollectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection findFirst
   */
  export type CollectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Collections.
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Collections.
     */
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * Collection findFirstOrThrow
   */
  export type CollectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collection to fetch.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Collections.
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Collections.
     */
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * Collection findMany
   */
  export type CollectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter, which Collections to fetch.
     */
    where?: CollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Collections to fetch.
     */
    orderBy?: CollectionOrderByWithRelationInput | CollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Collections.
     */
    cursor?: CollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Collections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Collections.
     */
    skip?: number
    distinct?: CollectionScalarFieldEnum | CollectionScalarFieldEnum[]
  }

  /**
   * Collection create
   */
  export type CollectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * The data needed to create a Collection.
     */
    data: XOR<CollectionCreateInput, CollectionUncheckedCreateInput>
  }

  /**
   * Collection createMany
   */
  export type CollectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Collections.
     */
    data: CollectionCreateManyInput | CollectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Collection createManyAndReturn
   */
  export type CollectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * The data used to create many Collections.
     */
    data: CollectionCreateManyInput | CollectionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Collection update
   */
  export type CollectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * The data needed to update a Collection.
     */
    data: XOR<CollectionUpdateInput, CollectionUncheckedUpdateInput>
    /**
     * Choose, which Collection to update.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection updateMany
   */
  export type CollectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Collections.
     */
    data: XOR<CollectionUpdateManyMutationInput, CollectionUncheckedUpdateManyInput>
    /**
     * Filter which Collections to update
     */
    where?: CollectionWhereInput
    /**
     * Limit how many Collections to update.
     */
    limit?: number
  }

  /**
   * Collection updateManyAndReturn
   */
  export type CollectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * The data used to update Collections.
     */
    data: XOR<CollectionUpdateManyMutationInput, CollectionUncheckedUpdateManyInput>
    /**
     * Filter which Collections to update
     */
    where?: CollectionWhereInput
    /**
     * Limit how many Collections to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Collection upsert
   */
  export type CollectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * The filter to search for the Collection to update in case it exists.
     */
    where: CollectionWhereUniqueInput
    /**
     * In case the Collection found by the `where` argument doesn't exist, create a new Collection with this data.
     */
    create: XOR<CollectionCreateInput, CollectionUncheckedCreateInput>
    /**
     * In case the Collection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CollectionUpdateInput, CollectionUncheckedUpdateInput>
  }

  /**
   * Collection delete
   */
  export type CollectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
    /**
     * Filter which Collection to delete.
     */
    where: CollectionWhereUniqueInput
  }

  /**
   * Collection deleteMany
   */
  export type CollectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Collections to delete
     */
    where?: CollectionWhereInput
    /**
     * Limit how many Collections to delete.
     */
    limit?: number
  }

  /**
   * Collection.campaigns
   */
  export type Collection$campaignsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    where?: CampaignCollectionWhereInput
    orderBy?: CampaignCollectionOrderByWithRelationInput | CampaignCollectionOrderByWithRelationInput[]
    cursor?: CampaignCollectionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CampaignCollectionScalarFieldEnum | CampaignCollectionScalarFieldEnum[]
  }

  /**
   * Collection without action
   */
  export type CollectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Collection
     */
    select?: CollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Collection
     */
    omit?: CollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollectionInclude<ExtArgs> | null
  }


  /**
   * Model CampaignCollection
   */

  export type AggregateCampaignCollection = {
    _count: CampaignCollectionCountAggregateOutputType | null
    _avg: CampaignCollectionAvgAggregateOutputType | null
    _sum: CampaignCollectionSumAggregateOutputType | null
    _min: CampaignCollectionMinAggregateOutputType | null
    _max: CampaignCollectionMaxAggregateOutputType | null
  }

  export type CampaignCollectionAvgAggregateOutputType = {
    campaignId: number | null
  }

  export type CampaignCollectionSumAggregateOutputType = {
    campaignId: number | null
  }

  export type CampaignCollectionMinAggregateOutputType = {
    campaignId: number | null
    collectionId: string | null
    assignedAt: Date | null
  }

  export type CampaignCollectionMaxAggregateOutputType = {
    campaignId: number | null
    collectionId: string | null
    assignedAt: Date | null
  }

  export type CampaignCollectionCountAggregateOutputType = {
    campaignId: number
    collectionId: number
    assignedAt: number
    _all: number
  }


  export type CampaignCollectionAvgAggregateInputType = {
    campaignId?: true
  }

  export type CampaignCollectionSumAggregateInputType = {
    campaignId?: true
  }

  export type CampaignCollectionMinAggregateInputType = {
    campaignId?: true
    collectionId?: true
    assignedAt?: true
  }

  export type CampaignCollectionMaxAggregateInputType = {
    campaignId?: true
    collectionId?: true
    assignedAt?: true
  }

  export type CampaignCollectionCountAggregateInputType = {
    campaignId?: true
    collectionId?: true
    assignedAt?: true
    _all?: true
  }

  export type CampaignCollectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignCollection to aggregate.
     */
    where?: CampaignCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignCollections to fetch.
     */
    orderBy?: CampaignCollectionOrderByWithRelationInput | CampaignCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CampaignCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignCollections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CampaignCollections
    **/
    _count?: true | CampaignCollectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CampaignCollectionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CampaignCollectionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CampaignCollectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CampaignCollectionMaxAggregateInputType
  }

  export type GetCampaignCollectionAggregateType<T extends CampaignCollectionAggregateArgs> = {
        [P in keyof T & keyof AggregateCampaignCollection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCampaignCollection[P]>
      : GetScalarType<T[P], AggregateCampaignCollection[P]>
  }




  export type CampaignCollectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignCollectionWhereInput
    orderBy?: CampaignCollectionOrderByWithAggregationInput | CampaignCollectionOrderByWithAggregationInput[]
    by: CampaignCollectionScalarFieldEnum[] | CampaignCollectionScalarFieldEnum
    having?: CampaignCollectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CampaignCollectionCountAggregateInputType | true
    _avg?: CampaignCollectionAvgAggregateInputType
    _sum?: CampaignCollectionSumAggregateInputType
    _min?: CampaignCollectionMinAggregateInputType
    _max?: CampaignCollectionMaxAggregateInputType
  }

  export type CampaignCollectionGroupByOutputType = {
    campaignId: number
    collectionId: string
    assignedAt: Date
    _count: CampaignCollectionCountAggregateOutputType | null
    _avg: CampaignCollectionAvgAggregateOutputType | null
    _sum: CampaignCollectionSumAggregateOutputType | null
    _min: CampaignCollectionMinAggregateOutputType | null
    _max: CampaignCollectionMaxAggregateOutputType | null
  }

  type GetCampaignCollectionGroupByPayload<T extends CampaignCollectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CampaignCollectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CampaignCollectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CampaignCollectionGroupByOutputType[P]>
            : GetScalarType<T[P], CampaignCollectionGroupByOutputType[P]>
        }
      >
    >


  export type CampaignCollectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    campaignId?: boolean
    collectionId?: boolean
    assignedAt?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignCollection"]>

  export type CampaignCollectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    campaignId?: boolean
    collectionId?: boolean
    assignedAt?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignCollection"]>

  export type CampaignCollectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    campaignId?: boolean
    collectionId?: boolean
    assignedAt?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignCollection"]>

  export type CampaignCollectionSelectScalar = {
    campaignId?: boolean
    collectionId?: boolean
    assignedAt?: boolean
  }

  export type CampaignCollectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"campaignId" | "collectionId" | "assignedAt", ExtArgs["result"]["campaignCollection"]>
  export type CampaignCollectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }
  export type CampaignCollectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }
  export type CampaignCollectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
    collection?: boolean | CollectionDefaultArgs<ExtArgs>
  }

  export type $CampaignCollectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CampaignCollection"
    objects: {
      campaign: Prisma.$CampaignPayload<ExtArgs>
      collection: Prisma.$CollectionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      campaignId: number
      collectionId: string
      assignedAt: Date
    }, ExtArgs["result"]["campaignCollection"]>
    composites: {}
  }

  type CampaignCollectionGetPayload<S extends boolean | null | undefined | CampaignCollectionDefaultArgs> = $Result.GetResult<Prisma.$CampaignCollectionPayload, S>

  type CampaignCollectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CampaignCollectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CampaignCollectionCountAggregateInputType | true
    }

  export interface CampaignCollectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CampaignCollection'], meta: { name: 'CampaignCollection' } }
    /**
     * Find zero or one CampaignCollection that matches the filter.
     * @param {CampaignCollectionFindUniqueArgs} args - Arguments to find a CampaignCollection
     * @example
     * // Get one CampaignCollection
     * const campaignCollection = await prisma.campaignCollection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CampaignCollectionFindUniqueArgs>(args: SelectSubset<T, CampaignCollectionFindUniqueArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CampaignCollection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CampaignCollectionFindUniqueOrThrowArgs} args - Arguments to find a CampaignCollection
     * @example
     * // Get one CampaignCollection
     * const campaignCollection = await prisma.campaignCollection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CampaignCollectionFindUniqueOrThrowArgs>(args: SelectSubset<T, CampaignCollectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CampaignCollection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCollectionFindFirstArgs} args - Arguments to find a CampaignCollection
     * @example
     * // Get one CampaignCollection
     * const campaignCollection = await prisma.campaignCollection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CampaignCollectionFindFirstArgs>(args?: SelectSubset<T, CampaignCollectionFindFirstArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CampaignCollection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCollectionFindFirstOrThrowArgs} args - Arguments to find a CampaignCollection
     * @example
     * // Get one CampaignCollection
     * const campaignCollection = await prisma.campaignCollection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CampaignCollectionFindFirstOrThrowArgs>(args?: SelectSubset<T, CampaignCollectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CampaignCollections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCollectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CampaignCollections
     * const campaignCollections = await prisma.campaignCollection.findMany()
     * 
     * // Get first 10 CampaignCollections
     * const campaignCollections = await prisma.campaignCollection.findMany({ take: 10 })
     * 
     * // Only select the `campaignId`
     * const campaignCollectionWithCampaignIdOnly = await prisma.campaignCollection.findMany({ select: { campaignId: true } })
     * 
     */
    findMany<T extends CampaignCollectionFindManyArgs>(args?: SelectSubset<T, CampaignCollectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CampaignCollection.
     * @param {CampaignCollectionCreateArgs} args - Arguments to create a CampaignCollection.
     * @example
     * // Create one CampaignCollection
     * const CampaignCollection = await prisma.campaignCollection.create({
     *   data: {
     *     // ... data to create a CampaignCollection
     *   }
     * })
     * 
     */
    create<T extends CampaignCollectionCreateArgs>(args: SelectSubset<T, CampaignCollectionCreateArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CampaignCollections.
     * @param {CampaignCollectionCreateManyArgs} args - Arguments to create many CampaignCollections.
     * @example
     * // Create many CampaignCollections
     * const campaignCollection = await prisma.campaignCollection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CampaignCollectionCreateManyArgs>(args?: SelectSubset<T, CampaignCollectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CampaignCollections and returns the data saved in the database.
     * @param {CampaignCollectionCreateManyAndReturnArgs} args - Arguments to create many CampaignCollections.
     * @example
     * // Create many CampaignCollections
     * const campaignCollection = await prisma.campaignCollection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CampaignCollections and only return the `campaignId`
     * const campaignCollectionWithCampaignIdOnly = await prisma.campaignCollection.createManyAndReturn({
     *   select: { campaignId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CampaignCollectionCreateManyAndReturnArgs>(args?: SelectSubset<T, CampaignCollectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CampaignCollection.
     * @param {CampaignCollectionDeleteArgs} args - Arguments to delete one CampaignCollection.
     * @example
     * // Delete one CampaignCollection
     * const CampaignCollection = await prisma.campaignCollection.delete({
     *   where: {
     *     // ... filter to delete one CampaignCollection
     *   }
     * })
     * 
     */
    delete<T extends CampaignCollectionDeleteArgs>(args: SelectSubset<T, CampaignCollectionDeleteArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CampaignCollection.
     * @param {CampaignCollectionUpdateArgs} args - Arguments to update one CampaignCollection.
     * @example
     * // Update one CampaignCollection
     * const campaignCollection = await prisma.campaignCollection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CampaignCollectionUpdateArgs>(args: SelectSubset<T, CampaignCollectionUpdateArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CampaignCollections.
     * @param {CampaignCollectionDeleteManyArgs} args - Arguments to filter CampaignCollections to delete.
     * @example
     * // Delete a few CampaignCollections
     * const { count } = await prisma.campaignCollection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CampaignCollectionDeleteManyArgs>(args?: SelectSubset<T, CampaignCollectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignCollections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCollectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CampaignCollections
     * const campaignCollection = await prisma.campaignCollection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CampaignCollectionUpdateManyArgs>(args: SelectSubset<T, CampaignCollectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignCollections and returns the data updated in the database.
     * @param {CampaignCollectionUpdateManyAndReturnArgs} args - Arguments to update many CampaignCollections.
     * @example
     * // Update many CampaignCollections
     * const campaignCollection = await prisma.campaignCollection.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CampaignCollections and only return the `campaignId`
     * const campaignCollectionWithCampaignIdOnly = await prisma.campaignCollection.updateManyAndReturn({
     *   select: { campaignId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CampaignCollectionUpdateManyAndReturnArgs>(args: SelectSubset<T, CampaignCollectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CampaignCollection.
     * @param {CampaignCollectionUpsertArgs} args - Arguments to update or create a CampaignCollection.
     * @example
     * // Update or create a CampaignCollection
     * const campaignCollection = await prisma.campaignCollection.upsert({
     *   create: {
     *     // ... data to create a CampaignCollection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CampaignCollection we want to update
     *   }
     * })
     */
    upsert<T extends CampaignCollectionUpsertArgs>(args: SelectSubset<T, CampaignCollectionUpsertArgs<ExtArgs>>): Prisma__CampaignCollectionClient<$Result.GetResult<Prisma.$CampaignCollectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CampaignCollections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCollectionCountArgs} args - Arguments to filter CampaignCollections to count.
     * @example
     * // Count the number of CampaignCollections
     * const count = await prisma.campaignCollection.count({
     *   where: {
     *     // ... the filter for the CampaignCollections we want to count
     *   }
     * })
    **/
    count<T extends CampaignCollectionCountArgs>(
      args?: Subset<T, CampaignCollectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CampaignCollectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CampaignCollection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCollectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CampaignCollectionAggregateArgs>(args: Subset<T, CampaignCollectionAggregateArgs>): Prisma.PrismaPromise<GetCampaignCollectionAggregateType<T>>

    /**
     * Group by CampaignCollection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCollectionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CampaignCollectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CampaignCollectionGroupByArgs['orderBy'] }
        : { orderBy?: CampaignCollectionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CampaignCollectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCampaignCollectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CampaignCollection model
   */
  readonly fields: CampaignCollectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CampaignCollection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CampaignCollectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    campaign<T extends CampaignDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignDefaultArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    collection<T extends CollectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CollectionDefaultArgs<ExtArgs>>): Prisma__CollectionClient<$Result.GetResult<Prisma.$CollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CampaignCollection model
   */
  interface CampaignCollectionFieldRefs {
    readonly campaignId: FieldRef<"CampaignCollection", 'Int'>
    readonly collectionId: FieldRef<"CampaignCollection", 'String'>
    readonly assignedAt: FieldRef<"CampaignCollection", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CampaignCollection findUnique
   */
  export type CampaignCollectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CampaignCollection to fetch.
     */
    where: CampaignCollectionWhereUniqueInput
  }

  /**
   * CampaignCollection findUniqueOrThrow
   */
  export type CampaignCollectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CampaignCollection to fetch.
     */
    where: CampaignCollectionWhereUniqueInput
  }

  /**
   * CampaignCollection findFirst
   */
  export type CampaignCollectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CampaignCollection to fetch.
     */
    where?: CampaignCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignCollections to fetch.
     */
    orderBy?: CampaignCollectionOrderByWithRelationInput | CampaignCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignCollections.
     */
    cursor?: CampaignCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignCollections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignCollections.
     */
    distinct?: CampaignCollectionScalarFieldEnum | CampaignCollectionScalarFieldEnum[]
  }

  /**
   * CampaignCollection findFirstOrThrow
   */
  export type CampaignCollectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CampaignCollection to fetch.
     */
    where?: CampaignCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignCollections to fetch.
     */
    orderBy?: CampaignCollectionOrderByWithRelationInput | CampaignCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignCollections.
     */
    cursor?: CampaignCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignCollections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignCollections.
     */
    distinct?: CampaignCollectionScalarFieldEnum | CampaignCollectionScalarFieldEnum[]
  }

  /**
   * CampaignCollection findMany
   */
  export type CampaignCollectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CampaignCollections to fetch.
     */
    where?: CampaignCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignCollections to fetch.
     */
    orderBy?: CampaignCollectionOrderByWithRelationInput | CampaignCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CampaignCollections.
     */
    cursor?: CampaignCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignCollections.
     */
    skip?: number
    distinct?: CampaignCollectionScalarFieldEnum | CampaignCollectionScalarFieldEnum[]
  }

  /**
   * CampaignCollection create
   */
  export type CampaignCollectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * The data needed to create a CampaignCollection.
     */
    data: XOR<CampaignCollectionCreateInput, CampaignCollectionUncheckedCreateInput>
  }

  /**
   * CampaignCollection createMany
   */
  export type CampaignCollectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CampaignCollections.
     */
    data: CampaignCollectionCreateManyInput | CampaignCollectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CampaignCollection createManyAndReturn
   */
  export type CampaignCollectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * The data used to create many CampaignCollections.
     */
    data: CampaignCollectionCreateManyInput | CampaignCollectionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CampaignCollection update
   */
  export type CampaignCollectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * The data needed to update a CampaignCollection.
     */
    data: XOR<CampaignCollectionUpdateInput, CampaignCollectionUncheckedUpdateInput>
    /**
     * Choose, which CampaignCollection to update.
     */
    where: CampaignCollectionWhereUniqueInput
  }

  /**
   * CampaignCollection updateMany
   */
  export type CampaignCollectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CampaignCollections.
     */
    data: XOR<CampaignCollectionUpdateManyMutationInput, CampaignCollectionUncheckedUpdateManyInput>
    /**
     * Filter which CampaignCollections to update
     */
    where?: CampaignCollectionWhereInput
    /**
     * Limit how many CampaignCollections to update.
     */
    limit?: number
  }

  /**
   * CampaignCollection updateManyAndReturn
   */
  export type CampaignCollectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * The data used to update CampaignCollections.
     */
    data: XOR<CampaignCollectionUpdateManyMutationInput, CampaignCollectionUncheckedUpdateManyInput>
    /**
     * Filter which CampaignCollections to update
     */
    where?: CampaignCollectionWhereInput
    /**
     * Limit how many CampaignCollections to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CampaignCollection upsert
   */
  export type CampaignCollectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * The filter to search for the CampaignCollection to update in case it exists.
     */
    where: CampaignCollectionWhereUniqueInput
    /**
     * In case the CampaignCollection found by the `where` argument doesn't exist, create a new CampaignCollection with this data.
     */
    create: XOR<CampaignCollectionCreateInput, CampaignCollectionUncheckedCreateInput>
    /**
     * In case the CampaignCollection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CampaignCollectionUpdateInput, CampaignCollectionUncheckedUpdateInput>
  }

  /**
   * CampaignCollection delete
   */
  export type CampaignCollectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
    /**
     * Filter which CampaignCollection to delete.
     */
    where: CampaignCollectionWhereUniqueInput
  }

  /**
   * CampaignCollection deleteMany
   */
  export type CampaignCollectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignCollections to delete
     */
    where?: CampaignCollectionWhereInput
    /**
     * Limit how many CampaignCollections to delete.
     */
    limit?: number
  }

  /**
   * CampaignCollection without action
   */
  export type CampaignCollectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignCollection
     */
    select?: CampaignCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignCollection
     */
    omit?: CampaignCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignCollectionInclude<ExtArgs> | null
  }


  /**
   * Model Favorite
   */

  export type AggregateFavorite = {
    _count: FavoriteCountAggregateOutputType | null
    _avg: FavoriteAvgAggregateOutputType | null
    _sum: FavoriteSumAggregateOutputType | null
    _min: FavoriteMinAggregateOutputType | null
    _max: FavoriteMaxAggregateOutputType | null
  }

  export type FavoriteAvgAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type FavoriteSumAggregateOutputType = {
    id: number | null
    campaignId: number | null
  }

  export type FavoriteMinAggregateOutputType = {
    id: number | null
    userAddress: string | null
    campaignId: number | null
    createdAt: Date | null
  }

  export type FavoriteMaxAggregateOutputType = {
    id: number | null
    userAddress: string | null
    campaignId: number | null
    createdAt: Date | null
  }

  export type FavoriteCountAggregateOutputType = {
    id: number
    userAddress: number
    campaignId: number
    createdAt: number
    _all: number
  }


  export type FavoriteAvgAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type FavoriteSumAggregateInputType = {
    id?: true
    campaignId?: true
  }

  export type FavoriteMinAggregateInputType = {
    id?: true
    userAddress?: true
    campaignId?: true
    createdAt?: true
  }

  export type FavoriteMaxAggregateInputType = {
    id?: true
    userAddress?: true
    campaignId?: true
    createdAt?: true
  }

  export type FavoriteCountAggregateInputType = {
    id?: true
    userAddress?: true
    campaignId?: true
    createdAt?: true
    _all?: true
  }

  export type FavoriteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Favorite to aggregate.
     */
    where?: FavoriteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Favorites to fetch.
     */
    orderBy?: FavoriteOrderByWithRelationInput | FavoriteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FavoriteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Favorites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Favorites
    **/
    _count?: true | FavoriteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FavoriteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FavoriteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FavoriteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FavoriteMaxAggregateInputType
  }

  export type GetFavoriteAggregateType<T extends FavoriteAggregateArgs> = {
        [P in keyof T & keyof AggregateFavorite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFavorite[P]>
      : GetScalarType<T[P], AggregateFavorite[P]>
  }




  export type FavoriteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FavoriteWhereInput
    orderBy?: FavoriteOrderByWithAggregationInput | FavoriteOrderByWithAggregationInput[]
    by: FavoriteScalarFieldEnum[] | FavoriteScalarFieldEnum
    having?: FavoriteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FavoriteCountAggregateInputType | true
    _avg?: FavoriteAvgAggregateInputType
    _sum?: FavoriteSumAggregateInputType
    _min?: FavoriteMinAggregateInputType
    _max?: FavoriteMaxAggregateInputType
  }

  export type FavoriteGroupByOutputType = {
    id: number
    userAddress: string
    campaignId: number
    createdAt: Date
    _count: FavoriteCountAggregateOutputType | null
    _avg: FavoriteAvgAggregateOutputType | null
    _sum: FavoriteSumAggregateOutputType | null
    _min: FavoriteMinAggregateOutputType | null
    _max: FavoriteMaxAggregateOutputType | null
  }

  type GetFavoriteGroupByPayload<T extends FavoriteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FavoriteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FavoriteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FavoriteGroupByOutputType[P]>
            : GetScalarType<T[P], FavoriteGroupByOutputType[P]>
        }
      >
    >


  export type FavoriteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userAddress?: boolean
    campaignId?: boolean
    createdAt?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["favorite"]>

  export type FavoriteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userAddress?: boolean
    campaignId?: boolean
    createdAt?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["favorite"]>

  export type FavoriteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userAddress?: boolean
    campaignId?: boolean
    createdAt?: boolean
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["favorite"]>

  export type FavoriteSelectScalar = {
    id?: boolean
    userAddress?: boolean
    campaignId?: boolean
    createdAt?: boolean
  }

  export type FavoriteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userAddress" | "campaignId" | "createdAt", ExtArgs["result"]["favorite"]>
  export type FavoriteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type FavoriteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }
  export type FavoriteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    campaign?: boolean | CampaignDefaultArgs<ExtArgs>
  }

  export type $FavoritePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Favorite"
    objects: {
      campaign: Prisma.$CampaignPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userAddress: string
      campaignId: number
      createdAt: Date
    }, ExtArgs["result"]["favorite"]>
    composites: {}
  }

  type FavoriteGetPayload<S extends boolean | null | undefined | FavoriteDefaultArgs> = $Result.GetResult<Prisma.$FavoritePayload, S>

  type FavoriteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FavoriteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FavoriteCountAggregateInputType | true
    }

  export interface FavoriteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Favorite'], meta: { name: 'Favorite' } }
    /**
     * Find zero or one Favorite that matches the filter.
     * @param {FavoriteFindUniqueArgs} args - Arguments to find a Favorite
     * @example
     * // Get one Favorite
     * const favorite = await prisma.favorite.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FavoriteFindUniqueArgs>(args: SelectSubset<T, FavoriteFindUniqueArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Favorite that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FavoriteFindUniqueOrThrowArgs} args - Arguments to find a Favorite
     * @example
     * // Get one Favorite
     * const favorite = await prisma.favorite.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FavoriteFindUniqueOrThrowArgs>(args: SelectSubset<T, FavoriteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Favorite that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoriteFindFirstArgs} args - Arguments to find a Favorite
     * @example
     * // Get one Favorite
     * const favorite = await prisma.favorite.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FavoriteFindFirstArgs>(args?: SelectSubset<T, FavoriteFindFirstArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Favorite that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoriteFindFirstOrThrowArgs} args - Arguments to find a Favorite
     * @example
     * // Get one Favorite
     * const favorite = await prisma.favorite.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FavoriteFindFirstOrThrowArgs>(args?: SelectSubset<T, FavoriteFindFirstOrThrowArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Favorites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoriteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Favorites
     * const favorites = await prisma.favorite.findMany()
     * 
     * // Get first 10 Favorites
     * const favorites = await prisma.favorite.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const favoriteWithIdOnly = await prisma.favorite.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FavoriteFindManyArgs>(args?: SelectSubset<T, FavoriteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Favorite.
     * @param {FavoriteCreateArgs} args - Arguments to create a Favorite.
     * @example
     * // Create one Favorite
     * const Favorite = await prisma.favorite.create({
     *   data: {
     *     // ... data to create a Favorite
     *   }
     * })
     * 
     */
    create<T extends FavoriteCreateArgs>(args: SelectSubset<T, FavoriteCreateArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Favorites.
     * @param {FavoriteCreateManyArgs} args - Arguments to create many Favorites.
     * @example
     * // Create many Favorites
     * const favorite = await prisma.favorite.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FavoriteCreateManyArgs>(args?: SelectSubset<T, FavoriteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Favorites and returns the data saved in the database.
     * @param {FavoriteCreateManyAndReturnArgs} args - Arguments to create many Favorites.
     * @example
     * // Create many Favorites
     * const favorite = await prisma.favorite.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Favorites and only return the `id`
     * const favoriteWithIdOnly = await prisma.favorite.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FavoriteCreateManyAndReturnArgs>(args?: SelectSubset<T, FavoriteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Favorite.
     * @param {FavoriteDeleteArgs} args - Arguments to delete one Favorite.
     * @example
     * // Delete one Favorite
     * const Favorite = await prisma.favorite.delete({
     *   where: {
     *     // ... filter to delete one Favorite
     *   }
     * })
     * 
     */
    delete<T extends FavoriteDeleteArgs>(args: SelectSubset<T, FavoriteDeleteArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Favorite.
     * @param {FavoriteUpdateArgs} args - Arguments to update one Favorite.
     * @example
     * // Update one Favorite
     * const favorite = await prisma.favorite.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FavoriteUpdateArgs>(args: SelectSubset<T, FavoriteUpdateArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Favorites.
     * @param {FavoriteDeleteManyArgs} args - Arguments to filter Favorites to delete.
     * @example
     * // Delete a few Favorites
     * const { count } = await prisma.favorite.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FavoriteDeleteManyArgs>(args?: SelectSubset<T, FavoriteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Favorites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoriteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Favorites
     * const favorite = await prisma.favorite.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FavoriteUpdateManyArgs>(args: SelectSubset<T, FavoriteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Favorites and returns the data updated in the database.
     * @param {FavoriteUpdateManyAndReturnArgs} args - Arguments to update many Favorites.
     * @example
     * // Update many Favorites
     * const favorite = await prisma.favorite.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Favorites and only return the `id`
     * const favoriteWithIdOnly = await prisma.favorite.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FavoriteUpdateManyAndReturnArgs>(args: SelectSubset<T, FavoriteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Favorite.
     * @param {FavoriteUpsertArgs} args - Arguments to update or create a Favorite.
     * @example
     * // Update or create a Favorite
     * const favorite = await prisma.favorite.upsert({
     *   create: {
     *     // ... data to create a Favorite
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Favorite we want to update
     *   }
     * })
     */
    upsert<T extends FavoriteUpsertArgs>(args: SelectSubset<T, FavoriteUpsertArgs<ExtArgs>>): Prisma__FavoriteClient<$Result.GetResult<Prisma.$FavoritePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Favorites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoriteCountArgs} args - Arguments to filter Favorites to count.
     * @example
     * // Count the number of Favorites
     * const count = await prisma.favorite.count({
     *   where: {
     *     // ... the filter for the Favorites we want to count
     *   }
     * })
    **/
    count<T extends FavoriteCountArgs>(
      args?: Subset<T, FavoriteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FavoriteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Favorite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoriteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FavoriteAggregateArgs>(args: Subset<T, FavoriteAggregateArgs>): Prisma.PrismaPromise<GetFavoriteAggregateType<T>>

    /**
     * Group by Favorite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoriteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FavoriteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FavoriteGroupByArgs['orderBy'] }
        : { orderBy?: FavoriteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FavoriteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFavoriteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Favorite model
   */
  readonly fields: FavoriteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Favorite.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FavoriteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    campaign<T extends CampaignDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignDefaultArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Favorite model
   */
  interface FavoriteFieldRefs {
    readonly id: FieldRef<"Favorite", 'Int'>
    readonly userAddress: FieldRef<"Favorite", 'String'>
    readonly campaignId: FieldRef<"Favorite", 'Int'>
    readonly createdAt: FieldRef<"Favorite", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Favorite findUnique
   */
  export type FavoriteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * Filter, which Favorite to fetch.
     */
    where: FavoriteWhereUniqueInput
  }

  /**
   * Favorite findUniqueOrThrow
   */
  export type FavoriteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * Filter, which Favorite to fetch.
     */
    where: FavoriteWhereUniqueInput
  }

  /**
   * Favorite findFirst
   */
  export type FavoriteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * Filter, which Favorite to fetch.
     */
    where?: FavoriteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Favorites to fetch.
     */
    orderBy?: FavoriteOrderByWithRelationInput | FavoriteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Favorites.
     */
    cursor?: FavoriteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Favorites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Favorites.
     */
    distinct?: FavoriteScalarFieldEnum | FavoriteScalarFieldEnum[]
  }

  /**
   * Favorite findFirstOrThrow
   */
  export type FavoriteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * Filter, which Favorite to fetch.
     */
    where?: FavoriteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Favorites to fetch.
     */
    orderBy?: FavoriteOrderByWithRelationInput | FavoriteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Favorites.
     */
    cursor?: FavoriteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Favorites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Favorites.
     */
    distinct?: FavoriteScalarFieldEnum | FavoriteScalarFieldEnum[]
  }

  /**
   * Favorite findMany
   */
  export type FavoriteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * Filter, which Favorites to fetch.
     */
    where?: FavoriteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Favorites to fetch.
     */
    orderBy?: FavoriteOrderByWithRelationInput | FavoriteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Favorites.
     */
    cursor?: FavoriteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Favorites.
     */
    skip?: number
    distinct?: FavoriteScalarFieldEnum | FavoriteScalarFieldEnum[]
  }

  /**
   * Favorite create
   */
  export type FavoriteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * The data needed to create a Favorite.
     */
    data: XOR<FavoriteCreateInput, FavoriteUncheckedCreateInput>
  }

  /**
   * Favorite createMany
   */
  export type FavoriteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Favorites.
     */
    data: FavoriteCreateManyInput | FavoriteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Favorite createManyAndReturn
   */
  export type FavoriteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * The data used to create many Favorites.
     */
    data: FavoriteCreateManyInput | FavoriteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Favorite update
   */
  export type FavoriteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * The data needed to update a Favorite.
     */
    data: XOR<FavoriteUpdateInput, FavoriteUncheckedUpdateInput>
    /**
     * Choose, which Favorite to update.
     */
    where: FavoriteWhereUniqueInput
  }

  /**
   * Favorite updateMany
   */
  export type FavoriteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Favorites.
     */
    data: XOR<FavoriteUpdateManyMutationInput, FavoriteUncheckedUpdateManyInput>
    /**
     * Filter which Favorites to update
     */
    where?: FavoriteWhereInput
    /**
     * Limit how many Favorites to update.
     */
    limit?: number
  }

  /**
   * Favorite updateManyAndReturn
   */
  export type FavoriteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * The data used to update Favorites.
     */
    data: XOR<FavoriteUpdateManyMutationInput, FavoriteUncheckedUpdateManyInput>
    /**
     * Filter which Favorites to update
     */
    where?: FavoriteWhereInput
    /**
     * Limit how many Favorites to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Favorite upsert
   */
  export type FavoriteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * The filter to search for the Favorite to update in case it exists.
     */
    where: FavoriteWhereUniqueInput
    /**
     * In case the Favorite found by the `where` argument doesn't exist, create a new Favorite with this data.
     */
    create: XOR<FavoriteCreateInput, FavoriteUncheckedCreateInput>
    /**
     * In case the Favorite was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FavoriteUpdateInput, FavoriteUncheckedUpdateInput>
  }

  /**
   * Favorite delete
   */
  export type FavoriteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
    /**
     * Filter which Favorite to delete.
     */
    where: FavoriteWhereUniqueInput
  }

  /**
   * Favorite deleteMany
   */
  export type FavoriteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Favorites to delete
     */
    where?: FavoriteWhereInput
    /**
     * Limit how many Favorites to delete.
     */
    limit?: number
  }

  /**
   * Favorite without action
   */
  export type FavoriteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Favorite
     */
    select?: FavoriteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Favorite
     */
    omit?: FavoriteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FavoriteInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CampaignScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    fundingGoal: 'fundingGoal',
    startTime: 'startTime',
    endTime: 'endTime',
    creatorAddress: 'creatorAddress',
    status: 'status',
    transactionHash: 'transactionHash',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    campaignAddress: 'campaignAddress',
    slug: 'slug',
    location: 'location',
    treasuryAddress: 'treasuryAddress',
    category: 'category'
  };

  export type CampaignScalarFieldEnum = (typeof CampaignScalarFieldEnum)[keyof typeof CampaignScalarFieldEnum]


  export const CampaignImageScalarFieldEnum: {
    id: 'id',
    imageUrl: 'imageUrl',
    isMainImage: 'isMainImage',
    campaignId: 'campaignId'
  };

  export type CampaignImageScalarFieldEnum = (typeof CampaignImageScalarFieldEnum)[keyof typeof CampaignImageScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    address: 'address',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const PaymentScalarFieldEnum: {
    id: 'id',
    amount: 'amount',
    token: 'token',
    status: 'status',
    transactionHash: 'transactionHash',
    isAnonymous: 'isAnonymous',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    campaignId: 'campaignId',
    userId: 'userId'
  };

  export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum]


  export const CommentScalarFieldEnum: {
    id: 'id',
    content: 'content',
    userAddress: 'userAddress',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    campaignId: 'campaignId'
  };

  export type CommentScalarFieldEnum = (typeof CommentScalarFieldEnum)[keyof typeof CommentScalarFieldEnum]


  export const CampaignUpdateScalarFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    campaignId: 'campaignId',
    creatorAddress: 'creatorAddress'
  };

  export type CampaignUpdateScalarFieldEnum = (typeof CampaignUpdateScalarFieldEnum)[keyof typeof CampaignUpdateScalarFieldEnum]


  export const RoundScalarFieldEnum: {
    id: 'id',
    poolId: 'poolId',
    strategyAddress: 'strategyAddress',
    profileId: 'profileId',
    managerAddress: 'managerAddress',
    transactionHash: 'transactionHash',
    title: 'title',
    description: 'description',
    tags: 'tags',
    matchingPool: 'matchingPool',
    tokenAddress: 'tokenAddress',
    tokenDecimals: 'tokenDecimals',
    applicationStart: 'applicationStart',
    applicationClose: 'applicationClose',
    startDate: 'startDate',
    endDate: 'endDate',
    blockchain: 'blockchain',
    logoUrl: 'logoUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RoundScalarFieldEnum = (typeof RoundScalarFieldEnum)[keyof typeof RoundScalarFieldEnum]


  export const RoundCampaignsScalarFieldEnum: {
    id: 'id',
    roundId: 'roundId',
    campaignId: 'campaignId',
    status: 'status',
    recipientAddress: 'recipientAddress',
    submittedByWalletAddress: 'submittedByWalletAddress',
    txHash: 'txHash',
    onchainRecipientId: 'onchainRecipientId',
    reviewedAt: 'reviewedAt'
  };

  export type RoundCampaignsScalarFieldEnum = (typeof RoundCampaignsScalarFieldEnum)[keyof typeof RoundCampaignsScalarFieldEnum]


  export const CollectionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type CollectionScalarFieldEnum = (typeof CollectionScalarFieldEnum)[keyof typeof CollectionScalarFieldEnum]


  export const CampaignCollectionScalarFieldEnum: {
    campaignId: 'campaignId',
    collectionId: 'collectionId',
    assignedAt: 'assignedAt'
  };

  export type CampaignCollectionScalarFieldEnum = (typeof CampaignCollectionScalarFieldEnum)[keyof typeof CampaignCollectionScalarFieldEnum]


  export const FavoriteScalarFieldEnum: {
    id: 'id',
    userAddress: 'userAddress',
    campaignId: 'campaignId',
    createdAt: 'createdAt'
  };

  export type FavoriteScalarFieldEnum = (typeof FavoriteScalarFieldEnum)[keyof typeof FavoriteScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CampaignStatus'
   */
  export type EnumCampaignStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CampaignStatus'>
    


  /**
   * Reference to a field of type 'CampaignStatus[]'
   */
  export type ListEnumCampaignStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CampaignStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'RecipientStatus'
   */
  export type EnumRecipientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RecipientStatus'>
    


  /**
   * Reference to a field of type 'RecipientStatus[]'
   */
  export type ListEnumRecipientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RecipientStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CampaignWhereInput = {
    AND?: CampaignWhereInput | CampaignWhereInput[]
    OR?: CampaignWhereInput[]
    NOT?: CampaignWhereInput | CampaignWhereInput[]
    id?: IntFilter<"Campaign"> | number
    title?: StringFilter<"Campaign"> | string
    description?: StringFilter<"Campaign"> | string
    fundingGoal?: StringFilter<"Campaign"> | string
    startTime?: DateTimeFilter<"Campaign"> | Date | string
    endTime?: DateTimeFilter<"Campaign"> | Date | string
    creatorAddress?: StringFilter<"Campaign"> | string
    status?: EnumCampaignStatusFilter<"Campaign"> | $Enums.CampaignStatus
    transactionHash?: StringNullableFilter<"Campaign"> | string | null
    createdAt?: DateTimeFilter<"Campaign"> | Date | string
    updatedAt?: DateTimeFilter<"Campaign"> | Date | string
    campaignAddress?: StringNullableFilter<"Campaign"> | string | null
    slug?: StringFilter<"Campaign"> | string
    location?: StringNullableFilter<"Campaign"> | string | null
    treasuryAddress?: StringNullableFilter<"Campaign"> | string | null
    category?: StringNullableFilter<"Campaign"> | string | null
    images?: CampaignImageListRelationFilter
    updates?: CampaignUpdateListRelationFilter
    comments?: CommentListRelationFilter
    payments?: PaymentListRelationFilter
    RoundCampaigns?: RoundCampaignsListRelationFilter
    collections?: CampaignCollectionListRelationFilter
    favorites?: FavoriteListRelationFilter
  }

  export type CampaignOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    fundingGoal?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    creatorAddress?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignAddress?: SortOrderInput | SortOrder
    slug?: SortOrder
    location?: SortOrderInput | SortOrder
    treasuryAddress?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    images?: CampaignImageOrderByRelationAggregateInput
    updates?: CampaignUpdateOrderByRelationAggregateInput
    comments?: CommentOrderByRelationAggregateInput
    payments?: PaymentOrderByRelationAggregateInput
    RoundCampaigns?: RoundCampaignsOrderByRelationAggregateInput
    collections?: CampaignCollectionOrderByRelationAggregateInput
    favorites?: FavoriteOrderByRelationAggregateInput
  }

  export type CampaignWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    campaignAddress?: string
    slug?: string
    AND?: CampaignWhereInput | CampaignWhereInput[]
    OR?: CampaignWhereInput[]
    NOT?: CampaignWhereInput | CampaignWhereInput[]
    title?: StringFilter<"Campaign"> | string
    description?: StringFilter<"Campaign"> | string
    fundingGoal?: StringFilter<"Campaign"> | string
    startTime?: DateTimeFilter<"Campaign"> | Date | string
    endTime?: DateTimeFilter<"Campaign"> | Date | string
    creatorAddress?: StringFilter<"Campaign"> | string
    status?: EnumCampaignStatusFilter<"Campaign"> | $Enums.CampaignStatus
    transactionHash?: StringNullableFilter<"Campaign"> | string | null
    createdAt?: DateTimeFilter<"Campaign"> | Date | string
    updatedAt?: DateTimeFilter<"Campaign"> | Date | string
    location?: StringNullableFilter<"Campaign"> | string | null
    treasuryAddress?: StringNullableFilter<"Campaign"> | string | null
    category?: StringNullableFilter<"Campaign"> | string | null
    images?: CampaignImageListRelationFilter
    updates?: CampaignUpdateListRelationFilter
    comments?: CommentListRelationFilter
    payments?: PaymentListRelationFilter
    RoundCampaigns?: RoundCampaignsListRelationFilter
    collections?: CampaignCollectionListRelationFilter
    favorites?: FavoriteListRelationFilter
  }, "id" | "campaignAddress" | "slug">

  export type CampaignOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    fundingGoal?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    creatorAddress?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignAddress?: SortOrderInput | SortOrder
    slug?: SortOrder
    location?: SortOrderInput | SortOrder
    treasuryAddress?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    _count?: CampaignCountOrderByAggregateInput
    _avg?: CampaignAvgOrderByAggregateInput
    _max?: CampaignMaxOrderByAggregateInput
    _min?: CampaignMinOrderByAggregateInput
    _sum?: CampaignSumOrderByAggregateInput
  }

  export type CampaignScalarWhereWithAggregatesInput = {
    AND?: CampaignScalarWhereWithAggregatesInput | CampaignScalarWhereWithAggregatesInput[]
    OR?: CampaignScalarWhereWithAggregatesInput[]
    NOT?: CampaignScalarWhereWithAggregatesInput | CampaignScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Campaign"> | number
    title?: StringWithAggregatesFilter<"Campaign"> | string
    description?: StringWithAggregatesFilter<"Campaign"> | string
    fundingGoal?: StringWithAggregatesFilter<"Campaign"> | string
    startTime?: DateTimeWithAggregatesFilter<"Campaign"> | Date | string
    endTime?: DateTimeWithAggregatesFilter<"Campaign"> | Date | string
    creatorAddress?: StringWithAggregatesFilter<"Campaign"> | string
    status?: EnumCampaignStatusWithAggregatesFilter<"Campaign"> | $Enums.CampaignStatus
    transactionHash?: StringNullableWithAggregatesFilter<"Campaign"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Campaign"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Campaign"> | Date | string
    campaignAddress?: StringNullableWithAggregatesFilter<"Campaign"> | string | null
    slug?: StringWithAggregatesFilter<"Campaign"> | string
    location?: StringNullableWithAggregatesFilter<"Campaign"> | string | null
    treasuryAddress?: StringNullableWithAggregatesFilter<"Campaign"> | string | null
    category?: StringNullableWithAggregatesFilter<"Campaign"> | string | null
  }

  export type CampaignImageWhereInput = {
    AND?: CampaignImageWhereInput | CampaignImageWhereInput[]
    OR?: CampaignImageWhereInput[]
    NOT?: CampaignImageWhereInput | CampaignImageWhereInput[]
    id?: IntFilter<"CampaignImage"> | number
    imageUrl?: StringFilter<"CampaignImage"> | string
    isMainImage?: BoolFilter<"CampaignImage"> | boolean
    campaignId?: IntFilter<"CampaignImage"> | number
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }

  export type CampaignImageOrderByWithRelationInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    isMainImage?: SortOrder
    campaignId?: SortOrder
    campaign?: CampaignOrderByWithRelationInput
  }

  export type CampaignImageWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CampaignImageWhereInput | CampaignImageWhereInput[]
    OR?: CampaignImageWhereInput[]
    NOT?: CampaignImageWhereInput | CampaignImageWhereInput[]
    imageUrl?: StringFilter<"CampaignImage"> | string
    isMainImage?: BoolFilter<"CampaignImage"> | boolean
    campaignId?: IntFilter<"CampaignImage"> | number
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }, "id">

  export type CampaignImageOrderByWithAggregationInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    isMainImage?: SortOrder
    campaignId?: SortOrder
    _count?: CampaignImageCountOrderByAggregateInput
    _avg?: CampaignImageAvgOrderByAggregateInput
    _max?: CampaignImageMaxOrderByAggregateInput
    _min?: CampaignImageMinOrderByAggregateInput
    _sum?: CampaignImageSumOrderByAggregateInput
  }

  export type CampaignImageScalarWhereWithAggregatesInput = {
    AND?: CampaignImageScalarWhereWithAggregatesInput | CampaignImageScalarWhereWithAggregatesInput[]
    OR?: CampaignImageScalarWhereWithAggregatesInput[]
    NOT?: CampaignImageScalarWhereWithAggregatesInput | CampaignImageScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CampaignImage"> | number
    imageUrl?: StringWithAggregatesFilter<"CampaignImage"> | string
    isMainImage?: BoolWithAggregatesFilter<"CampaignImage"> | boolean
    campaignId?: IntWithAggregatesFilter<"CampaignImage"> | number
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    address?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    payments?: PaymentListRelationFilter
    collections?: CollectionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    payments?: PaymentOrderByRelationAggregateInput
    collections?: CollectionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    address?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    payments?: PaymentListRelationFilter
    collections?: CollectionListRelationFilter
  }, "id" | "address">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    address?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type PaymentWhereInput = {
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    id?: IntFilter<"Payment"> | number
    amount?: StringFilter<"Payment"> | string
    token?: StringFilter<"Payment"> | string
    status?: StringFilter<"Payment"> | string
    transactionHash?: StringNullableFilter<"Payment"> | string | null
    isAnonymous?: BoolFilter<"Payment"> | boolean
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
    campaignId?: IntFilter<"Payment"> | number
    userId?: IntFilter<"Payment"> | number
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type PaymentOrderByWithRelationInput = {
    id?: SortOrder
    amount?: SortOrder
    token?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    isAnonymous?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    userId?: SortOrder
    campaign?: CampaignOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type PaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    amount?: StringFilter<"Payment"> | string
    token?: StringFilter<"Payment"> | string
    status?: StringFilter<"Payment"> | string
    transactionHash?: StringNullableFilter<"Payment"> | string | null
    isAnonymous?: BoolFilter<"Payment"> | boolean
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
    campaignId?: IntFilter<"Payment"> | number
    userId?: IntFilter<"Payment"> | number
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type PaymentOrderByWithAggregationInput = {
    id?: SortOrder
    amount?: SortOrder
    token?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    isAnonymous?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    userId?: SortOrder
    _count?: PaymentCountOrderByAggregateInput
    _avg?: PaymentAvgOrderByAggregateInput
    _max?: PaymentMaxOrderByAggregateInput
    _min?: PaymentMinOrderByAggregateInput
    _sum?: PaymentSumOrderByAggregateInput
  }

  export type PaymentScalarWhereWithAggregatesInput = {
    AND?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    OR?: PaymentScalarWhereWithAggregatesInput[]
    NOT?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Payment"> | number
    amount?: StringWithAggregatesFilter<"Payment"> | string
    token?: StringWithAggregatesFilter<"Payment"> | string
    status?: StringWithAggregatesFilter<"Payment"> | string
    transactionHash?: StringNullableWithAggregatesFilter<"Payment"> | string | null
    isAnonymous?: BoolWithAggregatesFilter<"Payment"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
    campaignId?: IntWithAggregatesFilter<"Payment"> | number
    userId?: IntWithAggregatesFilter<"Payment"> | number
  }

  export type CommentWhereInput = {
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    id?: IntFilter<"Comment"> | number
    content?: StringFilter<"Comment"> | string
    userAddress?: StringFilter<"Comment"> | string
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    campaignId?: IntFilter<"Comment"> | number
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }

  export type CommentOrderByWithRelationInput = {
    id?: SortOrder
    content?: SortOrder
    userAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    campaign?: CampaignOrderByWithRelationInput
  }

  export type CommentWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    content?: StringFilter<"Comment"> | string
    userAddress?: StringFilter<"Comment"> | string
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    campaignId?: IntFilter<"Comment"> | number
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }, "id">

  export type CommentOrderByWithAggregationInput = {
    id?: SortOrder
    content?: SortOrder
    userAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    _count?: CommentCountOrderByAggregateInput
    _avg?: CommentAvgOrderByAggregateInput
    _max?: CommentMaxOrderByAggregateInput
    _min?: CommentMinOrderByAggregateInput
    _sum?: CommentSumOrderByAggregateInput
  }

  export type CommentScalarWhereWithAggregatesInput = {
    AND?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    OR?: CommentScalarWhereWithAggregatesInput[]
    NOT?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Comment"> | number
    content?: StringWithAggregatesFilter<"Comment"> | string
    userAddress?: StringWithAggregatesFilter<"Comment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
    campaignId?: IntWithAggregatesFilter<"Comment"> | number
  }

  export type CampaignUpdateWhereInput = {
    AND?: CampaignUpdateWhereInput | CampaignUpdateWhereInput[]
    OR?: CampaignUpdateWhereInput[]
    NOT?: CampaignUpdateWhereInput | CampaignUpdateWhereInput[]
    id?: IntFilter<"CampaignUpdate"> | number
    title?: StringFilter<"CampaignUpdate"> | string
    content?: StringFilter<"CampaignUpdate"> | string
    createdAt?: DateTimeFilter<"CampaignUpdate"> | Date | string
    updatedAt?: DateTimeFilter<"CampaignUpdate"> | Date | string
    campaignId?: IntFilter<"CampaignUpdate"> | number
    creatorAddress?: StringFilter<"CampaignUpdate"> | string
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }

  export type CampaignUpdateOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    creatorAddress?: SortOrder
    campaign?: CampaignOrderByWithRelationInput
  }

  export type CampaignUpdateWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CampaignUpdateWhereInput | CampaignUpdateWhereInput[]
    OR?: CampaignUpdateWhereInput[]
    NOT?: CampaignUpdateWhereInput | CampaignUpdateWhereInput[]
    title?: StringFilter<"CampaignUpdate"> | string
    content?: StringFilter<"CampaignUpdate"> | string
    createdAt?: DateTimeFilter<"CampaignUpdate"> | Date | string
    updatedAt?: DateTimeFilter<"CampaignUpdate"> | Date | string
    campaignId?: IntFilter<"CampaignUpdate"> | number
    creatorAddress?: StringFilter<"CampaignUpdate"> | string
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }, "id">

  export type CampaignUpdateOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    creatorAddress?: SortOrder
    _count?: CampaignUpdateCountOrderByAggregateInput
    _avg?: CampaignUpdateAvgOrderByAggregateInput
    _max?: CampaignUpdateMaxOrderByAggregateInput
    _min?: CampaignUpdateMinOrderByAggregateInput
    _sum?: CampaignUpdateSumOrderByAggregateInput
  }

  export type CampaignUpdateScalarWhereWithAggregatesInput = {
    AND?: CampaignUpdateScalarWhereWithAggregatesInput | CampaignUpdateScalarWhereWithAggregatesInput[]
    OR?: CampaignUpdateScalarWhereWithAggregatesInput[]
    NOT?: CampaignUpdateScalarWhereWithAggregatesInput | CampaignUpdateScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CampaignUpdate"> | number
    title?: StringWithAggregatesFilter<"CampaignUpdate"> | string
    content?: StringWithAggregatesFilter<"CampaignUpdate"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CampaignUpdate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CampaignUpdate"> | Date | string
    campaignId?: IntWithAggregatesFilter<"CampaignUpdate"> | number
    creatorAddress?: StringWithAggregatesFilter<"CampaignUpdate"> | string
  }

  export type RoundWhereInput = {
    AND?: RoundWhereInput | RoundWhereInput[]
    OR?: RoundWhereInput[]
    NOT?: RoundWhereInput | RoundWhereInput[]
    id?: IntFilter<"Round"> | number
    poolId?: BigIntNullableFilter<"Round"> | bigint | number | null
    strategyAddress?: StringFilter<"Round"> | string
    profileId?: StringFilter<"Round"> | string
    managerAddress?: StringFilter<"Round"> | string
    transactionHash?: StringNullableFilter<"Round"> | string | null
    title?: StringFilter<"Round"> | string
    description?: StringFilter<"Round"> | string
    tags?: StringNullableListFilter<"Round">
    matchingPool?: DecimalFilter<"Round"> | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFilter<"Round"> | string
    tokenDecimals?: IntFilter<"Round"> | number
    applicationStart?: DateTimeFilter<"Round"> | Date | string
    applicationClose?: DateTimeFilter<"Round"> | Date | string
    startDate?: DateTimeFilter<"Round"> | Date | string
    endDate?: DateTimeFilter<"Round"> | Date | string
    blockchain?: StringFilter<"Round"> | string
    logoUrl?: StringNullableFilter<"Round"> | string | null
    createdAt?: DateTimeFilter<"Round"> | Date | string
    updatedAt?: DateTimeFilter<"Round"> | Date | string
    roundCampaigns?: RoundCampaignsListRelationFilter
  }

  export type RoundOrderByWithRelationInput = {
    id?: SortOrder
    poolId?: SortOrderInput | SortOrder
    strategyAddress?: SortOrder
    profileId?: SortOrder
    managerAddress?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    title?: SortOrder
    description?: SortOrder
    tags?: SortOrder
    matchingPool?: SortOrder
    tokenAddress?: SortOrder
    tokenDecimals?: SortOrder
    applicationStart?: SortOrder
    applicationClose?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    blockchain?: SortOrder
    logoUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    roundCampaigns?: RoundCampaignsOrderByRelationAggregateInput
  }

  export type RoundWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    poolId?: bigint | number
    transactionHash?: string
    AND?: RoundWhereInput | RoundWhereInput[]
    OR?: RoundWhereInput[]
    NOT?: RoundWhereInput | RoundWhereInput[]
    strategyAddress?: StringFilter<"Round"> | string
    profileId?: StringFilter<"Round"> | string
    managerAddress?: StringFilter<"Round"> | string
    title?: StringFilter<"Round"> | string
    description?: StringFilter<"Round"> | string
    tags?: StringNullableListFilter<"Round">
    matchingPool?: DecimalFilter<"Round"> | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFilter<"Round"> | string
    tokenDecimals?: IntFilter<"Round"> | number
    applicationStart?: DateTimeFilter<"Round"> | Date | string
    applicationClose?: DateTimeFilter<"Round"> | Date | string
    startDate?: DateTimeFilter<"Round"> | Date | string
    endDate?: DateTimeFilter<"Round"> | Date | string
    blockchain?: StringFilter<"Round"> | string
    logoUrl?: StringNullableFilter<"Round"> | string | null
    createdAt?: DateTimeFilter<"Round"> | Date | string
    updatedAt?: DateTimeFilter<"Round"> | Date | string
    roundCampaigns?: RoundCampaignsListRelationFilter
  }, "id" | "poolId" | "transactionHash">

  export type RoundOrderByWithAggregationInput = {
    id?: SortOrder
    poolId?: SortOrderInput | SortOrder
    strategyAddress?: SortOrder
    profileId?: SortOrder
    managerAddress?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    title?: SortOrder
    description?: SortOrder
    tags?: SortOrder
    matchingPool?: SortOrder
    tokenAddress?: SortOrder
    tokenDecimals?: SortOrder
    applicationStart?: SortOrder
    applicationClose?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    blockchain?: SortOrder
    logoUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RoundCountOrderByAggregateInput
    _avg?: RoundAvgOrderByAggregateInput
    _max?: RoundMaxOrderByAggregateInput
    _min?: RoundMinOrderByAggregateInput
    _sum?: RoundSumOrderByAggregateInput
  }

  export type RoundScalarWhereWithAggregatesInput = {
    AND?: RoundScalarWhereWithAggregatesInput | RoundScalarWhereWithAggregatesInput[]
    OR?: RoundScalarWhereWithAggregatesInput[]
    NOT?: RoundScalarWhereWithAggregatesInput | RoundScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Round"> | number
    poolId?: BigIntNullableWithAggregatesFilter<"Round"> | bigint | number | null
    strategyAddress?: StringWithAggregatesFilter<"Round"> | string
    profileId?: StringWithAggregatesFilter<"Round"> | string
    managerAddress?: StringWithAggregatesFilter<"Round"> | string
    transactionHash?: StringNullableWithAggregatesFilter<"Round"> | string | null
    title?: StringWithAggregatesFilter<"Round"> | string
    description?: StringWithAggregatesFilter<"Round"> | string
    tags?: StringNullableListFilter<"Round">
    matchingPool?: DecimalWithAggregatesFilter<"Round"> | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringWithAggregatesFilter<"Round"> | string
    tokenDecimals?: IntWithAggregatesFilter<"Round"> | number
    applicationStart?: DateTimeWithAggregatesFilter<"Round"> | Date | string
    applicationClose?: DateTimeWithAggregatesFilter<"Round"> | Date | string
    startDate?: DateTimeWithAggregatesFilter<"Round"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"Round"> | Date | string
    blockchain?: StringWithAggregatesFilter<"Round"> | string
    logoUrl?: StringNullableWithAggregatesFilter<"Round"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Round"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Round"> | Date | string
  }

  export type RoundCampaignsWhereInput = {
    AND?: RoundCampaignsWhereInput | RoundCampaignsWhereInput[]
    OR?: RoundCampaignsWhereInput[]
    NOT?: RoundCampaignsWhereInput | RoundCampaignsWhereInput[]
    id?: IntFilter<"RoundCampaigns"> | number
    roundId?: IntFilter<"RoundCampaigns"> | number
    campaignId?: IntFilter<"RoundCampaigns"> | number
    status?: EnumRecipientStatusFilter<"RoundCampaigns"> | $Enums.RecipientStatus
    recipientAddress?: StringNullableFilter<"RoundCampaigns"> | string | null
    submittedByWalletAddress?: StringNullableFilter<"RoundCampaigns"> | string | null
    txHash?: StringNullableFilter<"RoundCampaigns"> | string | null
    onchainRecipientId?: StringNullableFilter<"RoundCampaigns"> | string | null
    reviewedAt?: DateTimeNullableFilter<"RoundCampaigns"> | Date | string | null
    Campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
    Round?: XOR<RoundScalarRelationFilter, RoundWhereInput>
  }

  export type RoundCampaignsOrderByWithRelationInput = {
    id?: SortOrder
    roundId?: SortOrder
    campaignId?: SortOrder
    status?: SortOrder
    recipientAddress?: SortOrderInput | SortOrder
    submittedByWalletAddress?: SortOrderInput | SortOrder
    txHash?: SortOrderInput | SortOrder
    onchainRecipientId?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    Campaign?: CampaignOrderByWithRelationInput
    Round?: RoundOrderByWithRelationInput
  }

  export type RoundCampaignsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    roundId_campaignId?: RoundCampaignsRoundIdCampaignIdCompoundUniqueInput
    AND?: RoundCampaignsWhereInput | RoundCampaignsWhereInput[]
    OR?: RoundCampaignsWhereInput[]
    NOT?: RoundCampaignsWhereInput | RoundCampaignsWhereInput[]
    roundId?: IntFilter<"RoundCampaigns"> | number
    campaignId?: IntFilter<"RoundCampaigns"> | number
    status?: EnumRecipientStatusFilter<"RoundCampaigns"> | $Enums.RecipientStatus
    recipientAddress?: StringNullableFilter<"RoundCampaigns"> | string | null
    submittedByWalletAddress?: StringNullableFilter<"RoundCampaigns"> | string | null
    txHash?: StringNullableFilter<"RoundCampaigns"> | string | null
    onchainRecipientId?: StringNullableFilter<"RoundCampaigns"> | string | null
    reviewedAt?: DateTimeNullableFilter<"RoundCampaigns"> | Date | string | null
    Campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
    Round?: XOR<RoundScalarRelationFilter, RoundWhereInput>
  }, "id" | "roundId_campaignId">

  export type RoundCampaignsOrderByWithAggregationInput = {
    id?: SortOrder
    roundId?: SortOrder
    campaignId?: SortOrder
    status?: SortOrder
    recipientAddress?: SortOrderInput | SortOrder
    submittedByWalletAddress?: SortOrderInput | SortOrder
    txHash?: SortOrderInput | SortOrder
    onchainRecipientId?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    _count?: RoundCampaignsCountOrderByAggregateInput
    _avg?: RoundCampaignsAvgOrderByAggregateInput
    _max?: RoundCampaignsMaxOrderByAggregateInput
    _min?: RoundCampaignsMinOrderByAggregateInput
    _sum?: RoundCampaignsSumOrderByAggregateInput
  }

  export type RoundCampaignsScalarWhereWithAggregatesInput = {
    AND?: RoundCampaignsScalarWhereWithAggregatesInput | RoundCampaignsScalarWhereWithAggregatesInput[]
    OR?: RoundCampaignsScalarWhereWithAggregatesInput[]
    NOT?: RoundCampaignsScalarWhereWithAggregatesInput | RoundCampaignsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"RoundCampaigns"> | number
    roundId?: IntWithAggregatesFilter<"RoundCampaigns"> | number
    campaignId?: IntWithAggregatesFilter<"RoundCampaigns"> | number
    status?: EnumRecipientStatusWithAggregatesFilter<"RoundCampaigns"> | $Enums.RecipientStatus
    recipientAddress?: StringNullableWithAggregatesFilter<"RoundCampaigns"> | string | null
    submittedByWalletAddress?: StringNullableWithAggregatesFilter<"RoundCampaigns"> | string | null
    txHash?: StringNullableWithAggregatesFilter<"RoundCampaigns"> | string | null
    onchainRecipientId?: StringNullableWithAggregatesFilter<"RoundCampaigns"> | string | null
    reviewedAt?: DateTimeNullableWithAggregatesFilter<"RoundCampaigns"> | Date | string | null
  }

  export type CollectionWhereInput = {
    AND?: CollectionWhereInput | CollectionWhereInput[]
    OR?: CollectionWhereInput[]
    NOT?: CollectionWhereInput | CollectionWhereInput[]
    id?: StringFilter<"Collection"> | string
    name?: StringFilter<"Collection"> | string
    description?: StringNullableFilter<"Collection"> | string | null
    createdAt?: DateTimeFilter<"Collection"> | Date | string
    updatedAt?: DateTimeFilter<"Collection"> | Date | string
    userId?: StringFilter<"Collection"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    campaigns?: CampaignCollectionListRelationFilter
  }

  export type CollectionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    campaigns?: CampaignCollectionOrderByRelationAggregateInput
  }

  export type CollectionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_name?: CollectionUserIdNameCompoundUniqueInput
    AND?: CollectionWhereInput | CollectionWhereInput[]
    OR?: CollectionWhereInput[]
    NOT?: CollectionWhereInput | CollectionWhereInput[]
    name?: StringFilter<"Collection"> | string
    description?: StringNullableFilter<"Collection"> | string | null
    createdAt?: DateTimeFilter<"Collection"> | Date | string
    updatedAt?: DateTimeFilter<"Collection"> | Date | string
    userId?: StringFilter<"Collection"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    campaigns?: CampaignCollectionListRelationFilter
  }, "id" | "userId_name">

  export type CollectionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: CollectionCountOrderByAggregateInput
    _max?: CollectionMaxOrderByAggregateInput
    _min?: CollectionMinOrderByAggregateInput
  }

  export type CollectionScalarWhereWithAggregatesInput = {
    AND?: CollectionScalarWhereWithAggregatesInput | CollectionScalarWhereWithAggregatesInput[]
    OR?: CollectionScalarWhereWithAggregatesInput[]
    NOT?: CollectionScalarWhereWithAggregatesInput | CollectionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Collection"> | string
    name?: StringWithAggregatesFilter<"Collection"> | string
    description?: StringNullableWithAggregatesFilter<"Collection"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Collection"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Collection"> | Date | string
    userId?: StringWithAggregatesFilter<"Collection"> | string
  }

  export type CampaignCollectionWhereInput = {
    AND?: CampaignCollectionWhereInput | CampaignCollectionWhereInput[]
    OR?: CampaignCollectionWhereInput[]
    NOT?: CampaignCollectionWhereInput | CampaignCollectionWhereInput[]
    campaignId?: IntFilter<"CampaignCollection"> | number
    collectionId?: StringFilter<"CampaignCollection"> | string
    assignedAt?: DateTimeFilter<"CampaignCollection"> | Date | string
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
    collection?: XOR<CollectionScalarRelationFilter, CollectionWhereInput>
  }

  export type CampaignCollectionOrderByWithRelationInput = {
    campaignId?: SortOrder
    collectionId?: SortOrder
    assignedAt?: SortOrder
    campaign?: CampaignOrderByWithRelationInput
    collection?: CollectionOrderByWithRelationInput
  }

  export type CampaignCollectionWhereUniqueInput = Prisma.AtLeast<{
    campaignId_collectionId?: CampaignCollectionCampaignIdCollectionIdCompoundUniqueInput
    AND?: CampaignCollectionWhereInput | CampaignCollectionWhereInput[]
    OR?: CampaignCollectionWhereInput[]
    NOT?: CampaignCollectionWhereInput | CampaignCollectionWhereInput[]
    campaignId?: IntFilter<"CampaignCollection"> | number
    collectionId?: StringFilter<"CampaignCollection"> | string
    assignedAt?: DateTimeFilter<"CampaignCollection"> | Date | string
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
    collection?: XOR<CollectionScalarRelationFilter, CollectionWhereInput>
  }, "campaignId_collectionId">

  export type CampaignCollectionOrderByWithAggregationInput = {
    campaignId?: SortOrder
    collectionId?: SortOrder
    assignedAt?: SortOrder
    _count?: CampaignCollectionCountOrderByAggregateInput
    _avg?: CampaignCollectionAvgOrderByAggregateInput
    _max?: CampaignCollectionMaxOrderByAggregateInput
    _min?: CampaignCollectionMinOrderByAggregateInput
    _sum?: CampaignCollectionSumOrderByAggregateInput
  }

  export type CampaignCollectionScalarWhereWithAggregatesInput = {
    AND?: CampaignCollectionScalarWhereWithAggregatesInput | CampaignCollectionScalarWhereWithAggregatesInput[]
    OR?: CampaignCollectionScalarWhereWithAggregatesInput[]
    NOT?: CampaignCollectionScalarWhereWithAggregatesInput | CampaignCollectionScalarWhereWithAggregatesInput[]
    campaignId?: IntWithAggregatesFilter<"CampaignCollection"> | number
    collectionId?: StringWithAggregatesFilter<"CampaignCollection"> | string
    assignedAt?: DateTimeWithAggregatesFilter<"CampaignCollection"> | Date | string
  }

  export type FavoriteWhereInput = {
    AND?: FavoriteWhereInput | FavoriteWhereInput[]
    OR?: FavoriteWhereInput[]
    NOT?: FavoriteWhereInput | FavoriteWhereInput[]
    id?: IntFilter<"Favorite"> | number
    userAddress?: StringFilter<"Favorite"> | string
    campaignId?: IntFilter<"Favorite"> | number
    createdAt?: DateTimeFilter<"Favorite"> | Date | string
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }

  export type FavoriteOrderByWithRelationInput = {
    id?: SortOrder
    userAddress?: SortOrder
    campaignId?: SortOrder
    createdAt?: SortOrder
    campaign?: CampaignOrderByWithRelationInput
  }

  export type FavoriteWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userAddress_campaignId?: FavoriteUserAddressCampaignIdCompoundUniqueInput
    AND?: FavoriteWhereInput | FavoriteWhereInput[]
    OR?: FavoriteWhereInput[]
    NOT?: FavoriteWhereInput | FavoriteWhereInput[]
    userAddress?: StringFilter<"Favorite"> | string
    campaignId?: IntFilter<"Favorite"> | number
    createdAt?: DateTimeFilter<"Favorite"> | Date | string
    campaign?: XOR<CampaignScalarRelationFilter, CampaignWhereInput>
  }, "id" | "userAddress_campaignId">

  export type FavoriteOrderByWithAggregationInput = {
    id?: SortOrder
    userAddress?: SortOrder
    campaignId?: SortOrder
    createdAt?: SortOrder
    _count?: FavoriteCountOrderByAggregateInput
    _avg?: FavoriteAvgOrderByAggregateInput
    _max?: FavoriteMaxOrderByAggregateInput
    _min?: FavoriteMinOrderByAggregateInput
    _sum?: FavoriteSumOrderByAggregateInput
  }

  export type FavoriteScalarWhereWithAggregatesInput = {
    AND?: FavoriteScalarWhereWithAggregatesInput | FavoriteScalarWhereWithAggregatesInput[]
    OR?: FavoriteScalarWhereWithAggregatesInput[]
    NOT?: FavoriteScalarWhereWithAggregatesInput | FavoriteScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Favorite"> | number
    userAddress?: StringWithAggregatesFilter<"Favorite"> | string
    campaignId?: IntWithAggregatesFilter<"Favorite"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Favorite"> | Date | string
  }

  export type CampaignCreateInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateCreateNestedManyWithoutCampaignInput
    comments?: CommentCreateNestedManyWithoutCampaignInput
    payments?: PaymentCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageUncheckedCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput
    comments?: CommentUncheckedCreateNestedManyWithoutCampaignInput
    payments?: PaymentUncheckedCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUpdateManyWithoutCampaignNestedInput
    comments?: CommentUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput
    comments?: CommentUncheckedUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignCreateManyInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
  }

  export type CampaignUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CampaignUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CampaignImageCreateInput = {
    imageUrl: string
    isMainImage?: boolean
    campaign: CampaignCreateNestedOneWithoutImagesInput
  }

  export type CampaignImageUncheckedCreateInput = {
    id?: number
    imageUrl: string
    isMainImage?: boolean
    campaignId: number
  }

  export type CampaignImageUpdateInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    isMainImage?: BoolFieldUpdateOperationsInput | boolean
    campaign?: CampaignUpdateOneRequiredWithoutImagesNestedInput
  }

  export type CampaignImageUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    imageUrl?: StringFieldUpdateOperationsInput | string
    isMainImage?: BoolFieldUpdateOperationsInput | boolean
    campaignId?: IntFieldUpdateOperationsInput | number
  }

  export type CampaignImageCreateManyInput = {
    id?: number
    imageUrl: string
    isMainImage?: boolean
    campaignId: number
  }

  export type CampaignImageUpdateManyMutationInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    isMainImage?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CampaignImageUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    imageUrl?: StringFieldUpdateOperationsInput | string
    isMainImage?: BoolFieldUpdateOperationsInput | boolean
    campaignId?: IntFieldUpdateOperationsInput | number
  }

  export type UserCreateInput = {
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: PaymentCreateNestedManyWithoutUserInput
    collections?: CollectionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    collections?: CollectionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: PaymentUpdateManyWithoutUserNestedInput
    collections?: CollectionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    collections?: CollectionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateInput = {
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    campaign: CampaignCreateNestedOneWithoutPaymentsInput
    user: UserCreateNestedOneWithoutPaymentsInput
  }

  export type PaymentUncheckedCreateInput = {
    id?: number
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
    userId: number
  }

  export type PaymentUpdateInput = {
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaign?: CampaignUpdateOneRequiredWithoutPaymentsNestedInput
    user?: UserUpdateOneRequiredWithoutPaymentsNestedInput
  }

  export type PaymentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type PaymentCreateManyInput = {
    id?: number
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
    userId: number
  }

  export type PaymentUpdateManyMutationInput = {
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type CommentCreateInput = {
    content: string
    userAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    campaign: CampaignCreateNestedOneWithoutCommentsInput
  }

  export type CommentUncheckedCreateInput = {
    id?: number
    content: string
    userAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
  }

  export type CommentUpdateInput = {
    content?: StringFieldUpdateOperationsInput | string
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaign?: CampaignUpdateOneRequiredWithoutCommentsNestedInput
  }

  export type CommentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
  }

  export type CommentCreateManyInput = {
    id?: number
    content: string
    userAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
  }

  export type CommentUpdateManyMutationInput = {
    content?: StringFieldUpdateOperationsInput | string
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
  }

  export type CampaignUpdateCreateInput = {
    title: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    creatorAddress: string
    campaign: CampaignCreateNestedOneWithoutUpdatesInput
  }

  export type CampaignUpdateUncheckedCreateInput = {
    id?: number
    title: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
    creatorAddress: string
  }

  export type CampaignUpdateUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    campaign?: CampaignUpdateOneRequiredWithoutUpdatesNestedInput
  }

  export type CampaignUpdateUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
    creatorAddress?: StringFieldUpdateOperationsInput | string
  }

  export type CampaignUpdateCreateManyInput = {
    id?: number
    title: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
    creatorAddress: string
  }

  export type CampaignUpdateUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
  }

  export type CampaignUpdateUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
    creatorAddress?: StringFieldUpdateOperationsInput | string
  }

  export type RoundCreateInput = {
    poolId?: bigint | number | null
    strategyAddress: string
    profileId: string
    managerAddress: string
    transactionHash?: string | null
    title: string
    description: string
    tags?: RoundCreatetagsInput | string[]
    matchingPool: Decimal | DecimalJsLike | number | string
    tokenAddress: string
    tokenDecimals: number
    applicationStart: Date | string
    applicationClose: Date | string
    startDate: Date | string
    endDate: Date | string
    blockchain: string
    logoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    roundCampaigns?: RoundCampaignsCreateNestedManyWithoutRoundInput
  }

  export type RoundUncheckedCreateInput = {
    id?: number
    poolId?: bigint | number | null
    strategyAddress: string
    profileId: string
    managerAddress: string
    transactionHash?: string | null
    title: string
    description: string
    tags?: RoundCreatetagsInput | string[]
    matchingPool: Decimal | DecimalJsLike | number | string
    tokenAddress: string
    tokenDecimals: number
    applicationStart: Date | string
    applicationClose: Date | string
    startDate: Date | string
    endDate: Date | string
    blockchain: string
    logoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    roundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutRoundInput
  }

  export type RoundUpdateInput = {
    poolId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    strategyAddress?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    managerAddress?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    tags?: RoundUpdatetagsInput | string[]
    matchingPool?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFieldUpdateOperationsInput | string
    tokenDecimals?: IntFieldUpdateOperationsInput | number
    applicationStart?: DateTimeFieldUpdateOperationsInput | Date | string
    applicationClose?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    blockchain?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roundCampaigns?: RoundCampaignsUpdateManyWithoutRoundNestedInput
  }

  export type RoundUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    poolId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    strategyAddress?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    managerAddress?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    tags?: RoundUpdatetagsInput | string[]
    matchingPool?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFieldUpdateOperationsInput | string
    tokenDecimals?: IntFieldUpdateOperationsInput | number
    applicationStart?: DateTimeFieldUpdateOperationsInput | Date | string
    applicationClose?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    blockchain?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutRoundNestedInput
  }

  export type RoundCreateManyInput = {
    id?: number
    poolId?: bigint | number | null
    strategyAddress: string
    profileId: string
    managerAddress: string
    transactionHash?: string | null
    title: string
    description: string
    tags?: RoundCreatetagsInput | string[]
    matchingPool: Decimal | DecimalJsLike | number | string
    tokenAddress: string
    tokenDecimals: number
    applicationStart: Date | string
    applicationClose: Date | string
    startDate: Date | string
    endDate: Date | string
    blockchain: string
    logoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RoundUpdateManyMutationInput = {
    poolId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    strategyAddress?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    managerAddress?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    tags?: RoundUpdatetagsInput | string[]
    matchingPool?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFieldUpdateOperationsInput | string
    tokenDecimals?: IntFieldUpdateOperationsInput | number
    applicationStart?: DateTimeFieldUpdateOperationsInput | Date | string
    applicationClose?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    blockchain?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoundUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    poolId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    strategyAddress?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    managerAddress?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    tags?: RoundUpdatetagsInput | string[]
    matchingPool?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFieldUpdateOperationsInput | string
    tokenDecimals?: IntFieldUpdateOperationsInput | number
    applicationStart?: DateTimeFieldUpdateOperationsInput | Date | string
    applicationClose?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    blockchain?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoundCampaignsCreateInput = {
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
    Campaign: CampaignCreateNestedOneWithoutRoundCampaignsInput
    Round: RoundCreateNestedOneWithoutRoundCampaignsInput
  }

  export type RoundCampaignsUncheckedCreateInput = {
    id?: number
    roundId: number
    campaignId: number
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
  }

  export type RoundCampaignsUpdateInput = {
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Campaign?: CampaignUpdateOneRequiredWithoutRoundCampaignsNestedInput
    Round?: RoundUpdateOneRequiredWithoutRoundCampaignsNestedInput
  }

  export type RoundCampaignsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    roundId?: IntFieldUpdateOperationsInput | number
    campaignId?: IntFieldUpdateOperationsInput | number
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RoundCampaignsCreateManyInput = {
    id?: number
    roundId: number
    campaignId: number
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
  }

  export type RoundCampaignsUpdateManyMutationInput = {
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RoundCampaignsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    roundId?: IntFieldUpdateOperationsInput | number
    campaignId?: IntFieldUpdateOperationsInput | number
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CollectionCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCollectionsInput
    campaigns?: CampaignCollectionCreateNestedManyWithoutCollectionInput
  }

  export type CollectionUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    campaigns?: CampaignCollectionUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type CollectionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCollectionsNestedInput
    campaigns?: CampaignCollectionUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    campaigns?: CampaignCollectionUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type CollectionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CollectionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type CampaignCollectionCreateInput = {
    assignedAt?: Date | string
    campaign: CampaignCreateNestedOneWithoutCollectionsInput
    collection: CollectionCreateNestedOneWithoutCampaignsInput
  }

  export type CampaignCollectionUncheckedCreateInput = {
    campaignId: number
    collectionId: string
    assignedAt?: Date | string
  }

  export type CampaignCollectionUpdateInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaign?: CampaignUpdateOneRequiredWithoutCollectionsNestedInput
    collection?: CollectionUpdateOneRequiredWithoutCampaignsNestedInput
  }

  export type CampaignCollectionUncheckedUpdateInput = {
    campaignId?: IntFieldUpdateOperationsInput | number
    collectionId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CampaignCollectionCreateManyInput = {
    campaignId: number
    collectionId: string
    assignedAt?: Date | string
  }

  export type CampaignCollectionUpdateManyMutationInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CampaignCollectionUncheckedUpdateManyInput = {
    campaignId?: IntFieldUpdateOperationsInput | number
    collectionId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FavoriteCreateInput = {
    userAddress: string
    createdAt?: Date | string
    campaign: CampaignCreateNestedOneWithoutFavoritesInput
  }

  export type FavoriteUncheckedCreateInput = {
    id?: number
    userAddress: string
    campaignId: number
    createdAt?: Date | string
  }

  export type FavoriteUpdateInput = {
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaign?: CampaignUpdateOneRequiredWithoutFavoritesNestedInput
  }

  export type FavoriteUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userAddress?: StringFieldUpdateOperationsInput | string
    campaignId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FavoriteCreateManyInput = {
    id?: number
    userAddress: string
    campaignId: number
    createdAt?: Date | string
  }

  export type FavoriteUpdateManyMutationInput = {
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FavoriteUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userAddress?: StringFieldUpdateOperationsInput | string
    campaignId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EnumCampaignStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusFilter<$PrismaModel> | $Enums.CampaignStatus
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type CampaignImageListRelationFilter = {
    every?: CampaignImageWhereInput
    some?: CampaignImageWhereInput
    none?: CampaignImageWhereInput
  }

  export type CampaignUpdateListRelationFilter = {
    every?: CampaignUpdateWhereInput
    some?: CampaignUpdateWhereInput
    none?: CampaignUpdateWhereInput
  }

  export type CommentListRelationFilter = {
    every?: CommentWhereInput
    some?: CommentWhereInput
    none?: CommentWhereInput
  }

  export type PaymentListRelationFilter = {
    every?: PaymentWhereInput
    some?: PaymentWhereInput
    none?: PaymentWhereInput
  }

  export type RoundCampaignsListRelationFilter = {
    every?: RoundCampaignsWhereInput
    some?: RoundCampaignsWhereInput
    none?: RoundCampaignsWhereInput
  }

  export type CampaignCollectionListRelationFilter = {
    every?: CampaignCollectionWhereInput
    some?: CampaignCollectionWhereInput
    none?: CampaignCollectionWhereInput
  }

  export type FavoriteListRelationFilter = {
    every?: FavoriteWhereInput
    some?: FavoriteWhereInput
    none?: FavoriteWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CampaignImageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CampaignUpdateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CommentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PaymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RoundCampaignsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CampaignCollectionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FavoriteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CampaignCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    fundingGoal?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    creatorAddress?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignAddress?: SortOrder
    slug?: SortOrder
    location?: SortOrder
    treasuryAddress?: SortOrder
    category?: SortOrder
  }

  export type CampaignAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CampaignMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    fundingGoal?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    creatorAddress?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignAddress?: SortOrder
    slug?: SortOrder
    location?: SortOrder
    treasuryAddress?: SortOrder
    category?: SortOrder
  }

  export type CampaignMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    fundingGoal?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    creatorAddress?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignAddress?: SortOrder
    slug?: SortOrder
    location?: SortOrder
    treasuryAddress?: SortOrder
    category?: SortOrder
  }

  export type CampaignSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumCampaignStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusWithAggregatesFilter<$PrismaModel> | $Enums.CampaignStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCampaignStatusFilter<$PrismaModel>
    _max?: NestedEnumCampaignStatusFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CampaignScalarRelationFilter = {
    is?: CampaignWhereInput
    isNot?: CampaignWhereInput
  }

  export type CampaignImageCountOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    isMainImage?: SortOrder
    campaignId?: SortOrder
  }

  export type CampaignImageAvgOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type CampaignImageMaxOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    isMainImage?: SortOrder
    campaignId?: SortOrder
  }

  export type CampaignImageMinOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    isMainImage?: SortOrder
    campaignId?: SortOrder
  }

  export type CampaignImageSumOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type CollectionListRelationFilter = {
    every?: CollectionWhereInput
    some?: CollectionWhereInput
    none?: CollectionWhereInput
  }

  export type CollectionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PaymentCountOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    token?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrder
    isAnonymous?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    userId?: SortOrder
  }

  export type PaymentAvgOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
    userId?: SortOrder
  }

  export type PaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    token?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrder
    isAnonymous?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    userId?: SortOrder
  }

  export type PaymentMinOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    token?: SortOrder
    status?: SortOrder
    transactionHash?: SortOrder
    isAnonymous?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    userId?: SortOrder
  }

  export type PaymentSumOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
    userId?: SortOrder
  }

  export type CommentCountOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    userAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
  }

  export type CommentAvgOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type CommentMaxOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    userAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
  }

  export type CommentMinOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    userAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
  }

  export type CommentSumOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type CampaignUpdateCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    creatorAddress?: SortOrder
  }

  export type CampaignUpdateAvgOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type CampaignUpdateMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    creatorAddress?: SortOrder
  }

  export type CampaignUpdateMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    campaignId?: SortOrder
    creatorAddress?: SortOrder
  }

  export type CampaignUpdateSumOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type RoundCountOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    strategyAddress?: SortOrder
    profileId?: SortOrder
    managerAddress?: SortOrder
    transactionHash?: SortOrder
    title?: SortOrder
    description?: SortOrder
    tags?: SortOrder
    matchingPool?: SortOrder
    tokenAddress?: SortOrder
    tokenDecimals?: SortOrder
    applicationStart?: SortOrder
    applicationClose?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    blockchain?: SortOrder
    logoUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoundAvgOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    matchingPool?: SortOrder
    tokenDecimals?: SortOrder
  }

  export type RoundMaxOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    strategyAddress?: SortOrder
    profileId?: SortOrder
    managerAddress?: SortOrder
    transactionHash?: SortOrder
    title?: SortOrder
    description?: SortOrder
    matchingPool?: SortOrder
    tokenAddress?: SortOrder
    tokenDecimals?: SortOrder
    applicationStart?: SortOrder
    applicationClose?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    blockchain?: SortOrder
    logoUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoundMinOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    strategyAddress?: SortOrder
    profileId?: SortOrder
    managerAddress?: SortOrder
    transactionHash?: SortOrder
    title?: SortOrder
    description?: SortOrder
    matchingPool?: SortOrder
    tokenAddress?: SortOrder
    tokenDecimals?: SortOrder
    applicationStart?: SortOrder
    applicationClose?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    blockchain?: SortOrder
    logoUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoundSumOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    matchingPool?: SortOrder
    tokenDecimals?: SortOrder
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type EnumRecipientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientStatus | EnumRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientStatusFilter<$PrismaModel> | $Enums.RecipientStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type RoundScalarRelationFilter = {
    is?: RoundWhereInput
    isNot?: RoundWhereInput
  }

  export type RoundCampaignsRoundIdCampaignIdCompoundUniqueInput = {
    roundId: number
    campaignId: number
  }

  export type RoundCampaignsCountOrderByAggregateInput = {
    id?: SortOrder
    roundId?: SortOrder
    campaignId?: SortOrder
    status?: SortOrder
    recipientAddress?: SortOrder
    submittedByWalletAddress?: SortOrder
    txHash?: SortOrder
    onchainRecipientId?: SortOrder
    reviewedAt?: SortOrder
  }

  export type RoundCampaignsAvgOrderByAggregateInput = {
    id?: SortOrder
    roundId?: SortOrder
    campaignId?: SortOrder
  }

  export type RoundCampaignsMaxOrderByAggregateInput = {
    id?: SortOrder
    roundId?: SortOrder
    campaignId?: SortOrder
    status?: SortOrder
    recipientAddress?: SortOrder
    submittedByWalletAddress?: SortOrder
    txHash?: SortOrder
    onchainRecipientId?: SortOrder
    reviewedAt?: SortOrder
  }

  export type RoundCampaignsMinOrderByAggregateInput = {
    id?: SortOrder
    roundId?: SortOrder
    campaignId?: SortOrder
    status?: SortOrder
    recipientAddress?: SortOrder
    submittedByWalletAddress?: SortOrder
    txHash?: SortOrder
    onchainRecipientId?: SortOrder
    reviewedAt?: SortOrder
  }

  export type RoundCampaignsSumOrderByAggregateInput = {
    id?: SortOrder
    roundId?: SortOrder
    campaignId?: SortOrder
  }

  export type EnumRecipientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientStatus | EnumRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientStatusWithAggregatesFilter<$PrismaModel> | $Enums.RecipientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRecipientStatusFilter<$PrismaModel>
    _max?: NestedEnumRecipientStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CollectionUserIdNameCompoundUniqueInput = {
    userId: string
    name: string
  }

  export type CollectionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type CollectionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type CollectionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type CollectionScalarRelationFilter = {
    is?: CollectionWhereInput
    isNot?: CollectionWhereInput
  }

  export type CampaignCollectionCampaignIdCollectionIdCompoundUniqueInput = {
    campaignId: number
    collectionId: string
  }

  export type CampaignCollectionCountOrderByAggregateInput = {
    campaignId?: SortOrder
    collectionId?: SortOrder
    assignedAt?: SortOrder
  }

  export type CampaignCollectionAvgOrderByAggregateInput = {
    campaignId?: SortOrder
  }

  export type CampaignCollectionMaxOrderByAggregateInput = {
    campaignId?: SortOrder
    collectionId?: SortOrder
    assignedAt?: SortOrder
  }

  export type CampaignCollectionMinOrderByAggregateInput = {
    campaignId?: SortOrder
    collectionId?: SortOrder
    assignedAt?: SortOrder
  }

  export type CampaignCollectionSumOrderByAggregateInput = {
    campaignId?: SortOrder
  }

  export type FavoriteUserAddressCampaignIdCompoundUniqueInput = {
    userAddress: string
    campaignId: number
  }

  export type FavoriteCountOrderByAggregateInput = {
    id?: SortOrder
    userAddress?: SortOrder
    campaignId?: SortOrder
    createdAt?: SortOrder
  }

  export type FavoriteAvgOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type FavoriteMaxOrderByAggregateInput = {
    id?: SortOrder
    userAddress?: SortOrder
    campaignId?: SortOrder
    createdAt?: SortOrder
  }

  export type FavoriteMinOrderByAggregateInput = {
    id?: SortOrder
    userAddress?: SortOrder
    campaignId?: SortOrder
    createdAt?: SortOrder
  }

  export type FavoriteSumOrderByAggregateInput = {
    id?: SortOrder
    campaignId?: SortOrder
  }

  export type CampaignImageCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CampaignImageCreateWithoutCampaignInput, CampaignImageUncheckedCreateWithoutCampaignInput> | CampaignImageCreateWithoutCampaignInput[] | CampaignImageUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignImageCreateOrConnectWithoutCampaignInput | CampaignImageCreateOrConnectWithoutCampaignInput[]
    createMany?: CampaignImageCreateManyCampaignInputEnvelope
    connect?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
  }

  export type CampaignUpdateCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CampaignUpdateCreateWithoutCampaignInput, CampaignUpdateUncheckedCreateWithoutCampaignInput> | CampaignUpdateCreateWithoutCampaignInput[] | CampaignUpdateUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignUpdateCreateOrConnectWithoutCampaignInput | CampaignUpdateCreateOrConnectWithoutCampaignInput[]
    createMany?: CampaignUpdateCreateManyCampaignInputEnvelope
    connect?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
  }

  export type CommentCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CommentCreateWithoutCampaignInput, CommentUncheckedCreateWithoutCampaignInput> | CommentCreateWithoutCampaignInput[] | CommentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutCampaignInput | CommentCreateOrConnectWithoutCampaignInput[]
    createMany?: CommentCreateManyCampaignInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type PaymentCreateNestedManyWithoutCampaignInput = {
    create?: XOR<PaymentCreateWithoutCampaignInput, PaymentUncheckedCreateWithoutCampaignInput> | PaymentCreateWithoutCampaignInput[] | PaymentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutCampaignInput | PaymentCreateOrConnectWithoutCampaignInput[]
    createMany?: PaymentCreateManyCampaignInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type RoundCampaignsCreateNestedManyWithoutCampaignInput = {
    create?: XOR<RoundCampaignsCreateWithoutCampaignInput, RoundCampaignsUncheckedCreateWithoutCampaignInput> | RoundCampaignsCreateWithoutCampaignInput[] | RoundCampaignsUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutCampaignInput | RoundCampaignsCreateOrConnectWithoutCampaignInput[]
    createMany?: RoundCampaignsCreateManyCampaignInputEnvelope
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
  }

  export type CampaignCollectionCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CampaignCollectionCreateWithoutCampaignInput, CampaignCollectionUncheckedCreateWithoutCampaignInput> | CampaignCollectionCreateWithoutCampaignInput[] | CampaignCollectionUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCampaignInput | CampaignCollectionCreateOrConnectWithoutCampaignInput[]
    createMany?: CampaignCollectionCreateManyCampaignInputEnvelope
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
  }

  export type FavoriteCreateNestedManyWithoutCampaignInput = {
    create?: XOR<FavoriteCreateWithoutCampaignInput, FavoriteUncheckedCreateWithoutCampaignInput> | FavoriteCreateWithoutCampaignInput[] | FavoriteUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: FavoriteCreateOrConnectWithoutCampaignInput | FavoriteCreateOrConnectWithoutCampaignInput[]
    createMany?: FavoriteCreateManyCampaignInputEnvelope
    connect?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
  }

  export type CampaignImageUncheckedCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CampaignImageCreateWithoutCampaignInput, CampaignImageUncheckedCreateWithoutCampaignInput> | CampaignImageCreateWithoutCampaignInput[] | CampaignImageUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignImageCreateOrConnectWithoutCampaignInput | CampaignImageCreateOrConnectWithoutCampaignInput[]
    createMany?: CampaignImageCreateManyCampaignInputEnvelope
    connect?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
  }

  export type CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CampaignUpdateCreateWithoutCampaignInput, CampaignUpdateUncheckedCreateWithoutCampaignInput> | CampaignUpdateCreateWithoutCampaignInput[] | CampaignUpdateUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignUpdateCreateOrConnectWithoutCampaignInput | CampaignUpdateCreateOrConnectWithoutCampaignInput[]
    createMany?: CampaignUpdateCreateManyCampaignInputEnvelope
    connect?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CommentCreateWithoutCampaignInput, CommentUncheckedCreateWithoutCampaignInput> | CommentCreateWithoutCampaignInput[] | CommentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutCampaignInput | CommentCreateOrConnectWithoutCampaignInput[]
    createMany?: CommentCreateManyCampaignInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type PaymentUncheckedCreateNestedManyWithoutCampaignInput = {
    create?: XOR<PaymentCreateWithoutCampaignInput, PaymentUncheckedCreateWithoutCampaignInput> | PaymentCreateWithoutCampaignInput[] | PaymentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutCampaignInput | PaymentCreateOrConnectWithoutCampaignInput[]
    createMany?: PaymentCreateManyCampaignInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput = {
    create?: XOR<RoundCampaignsCreateWithoutCampaignInput, RoundCampaignsUncheckedCreateWithoutCampaignInput> | RoundCampaignsCreateWithoutCampaignInput[] | RoundCampaignsUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutCampaignInput | RoundCampaignsCreateOrConnectWithoutCampaignInput[]
    createMany?: RoundCampaignsCreateManyCampaignInputEnvelope
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
  }

  export type CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput = {
    create?: XOR<CampaignCollectionCreateWithoutCampaignInput, CampaignCollectionUncheckedCreateWithoutCampaignInput> | CampaignCollectionCreateWithoutCampaignInput[] | CampaignCollectionUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCampaignInput | CampaignCollectionCreateOrConnectWithoutCampaignInput[]
    createMany?: CampaignCollectionCreateManyCampaignInputEnvelope
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
  }

  export type FavoriteUncheckedCreateNestedManyWithoutCampaignInput = {
    create?: XOR<FavoriteCreateWithoutCampaignInput, FavoriteUncheckedCreateWithoutCampaignInput> | FavoriteCreateWithoutCampaignInput[] | FavoriteUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: FavoriteCreateOrConnectWithoutCampaignInput | FavoriteCreateOrConnectWithoutCampaignInput[]
    createMany?: FavoriteCreateManyCampaignInputEnvelope
    connect?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EnumCampaignStatusFieldUpdateOperationsInput = {
    set?: $Enums.CampaignStatus
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type CampaignImageUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CampaignImageCreateWithoutCampaignInput, CampaignImageUncheckedCreateWithoutCampaignInput> | CampaignImageCreateWithoutCampaignInput[] | CampaignImageUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignImageCreateOrConnectWithoutCampaignInput | CampaignImageCreateOrConnectWithoutCampaignInput[]
    upsert?: CampaignImageUpsertWithWhereUniqueWithoutCampaignInput | CampaignImageUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CampaignImageCreateManyCampaignInputEnvelope
    set?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    disconnect?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    delete?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    connect?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    update?: CampaignImageUpdateWithWhereUniqueWithoutCampaignInput | CampaignImageUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CampaignImageUpdateManyWithWhereWithoutCampaignInput | CampaignImageUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CampaignImageScalarWhereInput | CampaignImageScalarWhereInput[]
  }

  export type CampaignUpdateUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CampaignUpdateCreateWithoutCampaignInput, CampaignUpdateUncheckedCreateWithoutCampaignInput> | CampaignUpdateCreateWithoutCampaignInput[] | CampaignUpdateUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignUpdateCreateOrConnectWithoutCampaignInput | CampaignUpdateCreateOrConnectWithoutCampaignInput[]
    upsert?: CampaignUpdateUpsertWithWhereUniqueWithoutCampaignInput | CampaignUpdateUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CampaignUpdateCreateManyCampaignInputEnvelope
    set?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    disconnect?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    delete?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    connect?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    update?: CampaignUpdateUpdateWithWhereUniqueWithoutCampaignInput | CampaignUpdateUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CampaignUpdateUpdateManyWithWhereWithoutCampaignInput | CampaignUpdateUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CampaignUpdateScalarWhereInput | CampaignUpdateScalarWhereInput[]
  }

  export type CommentUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CommentCreateWithoutCampaignInput, CommentUncheckedCreateWithoutCampaignInput> | CommentCreateWithoutCampaignInput[] | CommentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutCampaignInput | CommentCreateOrConnectWithoutCampaignInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutCampaignInput | CommentUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CommentCreateManyCampaignInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutCampaignInput | CommentUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutCampaignInput | CommentUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type PaymentUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<PaymentCreateWithoutCampaignInput, PaymentUncheckedCreateWithoutCampaignInput> | PaymentCreateWithoutCampaignInput[] | PaymentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutCampaignInput | PaymentCreateOrConnectWithoutCampaignInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutCampaignInput | PaymentUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: PaymentCreateManyCampaignInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutCampaignInput | PaymentUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutCampaignInput | PaymentUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type RoundCampaignsUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<RoundCampaignsCreateWithoutCampaignInput, RoundCampaignsUncheckedCreateWithoutCampaignInput> | RoundCampaignsCreateWithoutCampaignInput[] | RoundCampaignsUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutCampaignInput | RoundCampaignsCreateOrConnectWithoutCampaignInput[]
    upsert?: RoundCampaignsUpsertWithWhereUniqueWithoutCampaignInput | RoundCampaignsUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: RoundCampaignsCreateManyCampaignInputEnvelope
    set?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    disconnect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    delete?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    update?: RoundCampaignsUpdateWithWhereUniqueWithoutCampaignInput | RoundCampaignsUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: RoundCampaignsUpdateManyWithWhereWithoutCampaignInput | RoundCampaignsUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: RoundCampaignsScalarWhereInput | RoundCampaignsScalarWhereInput[]
  }

  export type CampaignCollectionUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CampaignCollectionCreateWithoutCampaignInput, CampaignCollectionUncheckedCreateWithoutCampaignInput> | CampaignCollectionCreateWithoutCampaignInput[] | CampaignCollectionUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCampaignInput | CampaignCollectionCreateOrConnectWithoutCampaignInput[]
    upsert?: CampaignCollectionUpsertWithWhereUniqueWithoutCampaignInput | CampaignCollectionUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CampaignCollectionCreateManyCampaignInputEnvelope
    set?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    disconnect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    delete?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    update?: CampaignCollectionUpdateWithWhereUniqueWithoutCampaignInput | CampaignCollectionUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CampaignCollectionUpdateManyWithWhereWithoutCampaignInput | CampaignCollectionUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CampaignCollectionScalarWhereInput | CampaignCollectionScalarWhereInput[]
  }

  export type FavoriteUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<FavoriteCreateWithoutCampaignInput, FavoriteUncheckedCreateWithoutCampaignInput> | FavoriteCreateWithoutCampaignInput[] | FavoriteUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: FavoriteCreateOrConnectWithoutCampaignInput | FavoriteCreateOrConnectWithoutCampaignInput[]
    upsert?: FavoriteUpsertWithWhereUniqueWithoutCampaignInput | FavoriteUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: FavoriteCreateManyCampaignInputEnvelope
    set?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    disconnect?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    delete?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    connect?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    update?: FavoriteUpdateWithWhereUniqueWithoutCampaignInput | FavoriteUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: FavoriteUpdateManyWithWhereWithoutCampaignInput | FavoriteUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: FavoriteScalarWhereInput | FavoriteScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CampaignImageCreateWithoutCampaignInput, CampaignImageUncheckedCreateWithoutCampaignInput> | CampaignImageCreateWithoutCampaignInput[] | CampaignImageUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignImageCreateOrConnectWithoutCampaignInput | CampaignImageCreateOrConnectWithoutCampaignInput[]
    upsert?: CampaignImageUpsertWithWhereUniqueWithoutCampaignInput | CampaignImageUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CampaignImageCreateManyCampaignInputEnvelope
    set?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    disconnect?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    delete?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    connect?: CampaignImageWhereUniqueInput | CampaignImageWhereUniqueInput[]
    update?: CampaignImageUpdateWithWhereUniqueWithoutCampaignInput | CampaignImageUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CampaignImageUpdateManyWithWhereWithoutCampaignInput | CampaignImageUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CampaignImageScalarWhereInput | CampaignImageScalarWhereInput[]
  }

  export type CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CampaignUpdateCreateWithoutCampaignInput, CampaignUpdateUncheckedCreateWithoutCampaignInput> | CampaignUpdateCreateWithoutCampaignInput[] | CampaignUpdateUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignUpdateCreateOrConnectWithoutCampaignInput | CampaignUpdateCreateOrConnectWithoutCampaignInput[]
    upsert?: CampaignUpdateUpsertWithWhereUniqueWithoutCampaignInput | CampaignUpdateUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CampaignUpdateCreateManyCampaignInputEnvelope
    set?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    disconnect?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    delete?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    connect?: CampaignUpdateWhereUniqueInput | CampaignUpdateWhereUniqueInput[]
    update?: CampaignUpdateUpdateWithWhereUniqueWithoutCampaignInput | CampaignUpdateUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CampaignUpdateUpdateManyWithWhereWithoutCampaignInput | CampaignUpdateUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CampaignUpdateScalarWhereInput | CampaignUpdateScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CommentCreateWithoutCampaignInput, CommentUncheckedCreateWithoutCampaignInput> | CommentCreateWithoutCampaignInput[] | CommentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutCampaignInput | CommentCreateOrConnectWithoutCampaignInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutCampaignInput | CommentUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CommentCreateManyCampaignInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutCampaignInput | CommentUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutCampaignInput | CommentUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type PaymentUncheckedUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<PaymentCreateWithoutCampaignInput, PaymentUncheckedCreateWithoutCampaignInput> | PaymentCreateWithoutCampaignInput[] | PaymentUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutCampaignInput | PaymentCreateOrConnectWithoutCampaignInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutCampaignInput | PaymentUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: PaymentCreateManyCampaignInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutCampaignInput | PaymentUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutCampaignInput | PaymentUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<RoundCampaignsCreateWithoutCampaignInput, RoundCampaignsUncheckedCreateWithoutCampaignInput> | RoundCampaignsCreateWithoutCampaignInput[] | RoundCampaignsUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutCampaignInput | RoundCampaignsCreateOrConnectWithoutCampaignInput[]
    upsert?: RoundCampaignsUpsertWithWhereUniqueWithoutCampaignInput | RoundCampaignsUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: RoundCampaignsCreateManyCampaignInputEnvelope
    set?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    disconnect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    delete?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    update?: RoundCampaignsUpdateWithWhereUniqueWithoutCampaignInput | RoundCampaignsUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: RoundCampaignsUpdateManyWithWhereWithoutCampaignInput | RoundCampaignsUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: RoundCampaignsScalarWhereInput | RoundCampaignsScalarWhereInput[]
  }

  export type CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<CampaignCollectionCreateWithoutCampaignInput, CampaignCollectionUncheckedCreateWithoutCampaignInput> | CampaignCollectionCreateWithoutCampaignInput[] | CampaignCollectionUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCampaignInput | CampaignCollectionCreateOrConnectWithoutCampaignInput[]
    upsert?: CampaignCollectionUpsertWithWhereUniqueWithoutCampaignInput | CampaignCollectionUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: CampaignCollectionCreateManyCampaignInputEnvelope
    set?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    disconnect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    delete?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    update?: CampaignCollectionUpdateWithWhereUniqueWithoutCampaignInput | CampaignCollectionUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: CampaignCollectionUpdateManyWithWhereWithoutCampaignInput | CampaignCollectionUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: CampaignCollectionScalarWhereInput | CampaignCollectionScalarWhereInput[]
  }

  export type FavoriteUncheckedUpdateManyWithoutCampaignNestedInput = {
    create?: XOR<FavoriteCreateWithoutCampaignInput, FavoriteUncheckedCreateWithoutCampaignInput> | FavoriteCreateWithoutCampaignInput[] | FavoriteUncheckedCreateWithoutCampaignInput[]
    connectOrCreate?: FavoriteCreateOrConnectWithoutCampaignInput | FavoriteCreateOrConnectWithoutCampaignInput[]
    upsert?: FavoriteUpsertWithWhereUniqueWithoutCampaignInput | FavoriteUpsertWithWhereUniqueWithoutCampaignInput[]
    createMany?: FavoriteCreateManyCampaignInputEnvelope
    set?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    disconnect?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    delete?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    connect?: FavoriteWhereUniqueInput | FavoriteWhereUniqueInput[]
    update?: FavoriteUpdateWithWhereUniqueWithoutCampaignInput | FavoriteUpdateWithWhereUniqueWithoutCampaignInput[]
    updateMany?: FavoriteUpdateManyWithWhereWithoutCampaignInput | FavoriteUpdateManyWithWhereWithoutCampaignInput[]
    deleteMany?: FavoriteScalarWhereInput | FavoriteScalarWhereInput[]
  }

  export type CampaignCreateNestedOneWithoutImagesInput = {
    create?: XOR<CampaignCreateWithoutImagesInput, CampaignUncheckedCreateWithoutImagesInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutImagesInput
    connect?: CampaignWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type CampaignUpdateOneRequiredWithoutImagesNestedInput = {
    create?: XOR<CampaignCreateWithoutImagesInput, CampaignUncheckedCreateWithoutImagesInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutImagesInput
    upsert?: CampaignUpsertWithoutImagesInput
    connect?: CampaignWhereUniqueInput
    update?: XOR<XOR<CampaignUpdateToOneWithWhereWithoutImagesInput, CampaignUpdateWithoutImagesInput>, CampaignUncheckedUpdateWithoutImagesInput>
  }

  export type PaymentCreateNestedManyWithoutUserInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type CollectionCreateNestedManyWithoutUserInput = {
    create?: XOR<CollectionCreateWithoutUserInput, CollectionUncheckedCreateWithoutUserInput> | CollectionCreateWithoutUserInput[] | CollectionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CollectionCreateOrConnectWithoutUserInput | CollectionCreateOrConnectWithoutUserInput[]
    createMany?: CollectionCreateManyUserInputEnvelope
    connect?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
  }

  export type PaymentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type CollectionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<CollectionCreateWithoutUserInput, CollectionUncheckedCreateWithoutUserInput> | CollectionCreateWithoutUserInput[] | CollectionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CollectionCreateOrConnectWithoutUserInput | CollectionCreateOrConnectWithoutUserInput[]
    createMany?: CollectionCreateManyUserInputEnvelope
    connect?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
  }

  export type PaymentUpdateManyWithoutUserNestedInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutUserInput | PaymentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutUserInput | PaymentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutUserInput | PaymentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type CollectionUpdateManyWithoutUserNestedInput = {
    create?: XOR<CollectionCreateWithoutUserInput, CollectionUncheckedCreateWithoutUserInput> | CollectionCreateWithoutUserInput[] | CollectionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CollectionCreateOrConnectWithoutUserInput | CollectionCreateOrConnectWithoutUserInput[]
    upsert?: CollectionUpsertWithWhereUniqueWithoutUserInput | CollectionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CollectionCreateManyUserInputEnvelope
    set?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    disconnect?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    delete?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    connect?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    update?: CollectionUpdateWithWhereUniqueWithoutUserInput | CollectionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CollectionUpdateManyWithWhereWithoutUserInput | CollectionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CollectionScalarWhereInput | CollectionScalarWhereInput[]
  }

  export type PaymentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutUserInput | PaymentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutUserInput | PaymentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutUserInput | PaymentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type CollectionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<CollectionCreateWithoutUserInput, CollectionUncheckedCreateWithoutUserInput> | CollectionCreateWithoutUserInput[] | CollectionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CollectionCreateOrConnectWithoutUserInput | CollectionCreateOrConnectWithoutUserInput[]
    upsert?: CollectionUpsertWithWhereUniqueWithoutUserInput | CollectionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CollectionCreateManyUserInputEnvelope
    set?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    disconnect?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    delete?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    connect?: CollectionWhereUniqueInput | CollectionWhereUniqueInput[]
    update?: CollectionUpdateWithWhereUniqueWithoutUserInput | CollectionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CollectionUpdateManyWithWhereWithoutUserInput | CollectionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CollectionScalarWhereInput | CollectionScalarWhereInput[]
  }

  export type CampaignCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<CampaignCreateWithoutPaymentsInput, CampaignUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutPaymentsInput
    connect?: CampaignWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    connect?: UserWhereUniqueInput
  }

  export type CampaignUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<CampaignCreateWithoutPaymentsInput, CampaignUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutPaymentsInput
    upsert?: CampaignUpsertWithoutPaymentsInput
    connect?: CampaignWhereUniqueInput
    update?: XOR<XOR<CampaignUpdateToOneWithWhereWithoutPaymentsInput, CampaignUpdateWithoutPaymentsInput>, CampaignUncheckedUpdateWithoutPaymentsInput>
  }

  export type UserUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    upsert?: UserUpsertWithoutPaymentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPaymentsInput, UserUpdateWithoutPaymentsInput>, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type CampaignCreateNestedOneWithoutCommentsInput = {
    create?: XOR<CampaignCreateWithoutCommentsInput, CampaignUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutCommentsInput
    connect?: CampaignWhereUniqueInput
  }

  export type CampaignUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: XOR<CampaignCreateWithoutCommentsInput, CampaignUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutCommentsInput
    upsert?: CampaignUpsertWithoutCommentsInput
    connect?: CampaignWhereUniqueInput
    update?: XOR<XOR<CampaignUpdateToOneWithWhereWithoutCommentsInput, CampaignUpdateWithoutCommentsInput>, CampaignUncheckedUpdateWithoutCommentsInput>
  }

  export type CampaignCreateNestedOneWithoutUpdatesInput = {
    create?: XOR<CampaignCreateWithoutUpdatesInput, CampaignUncheckedCreateWithoutUpdatesInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutUpdatesInput
    connect?: CampaignWhereUniqueInput
  }

  export type CampaignUpdateOneRequiredWithoutUpdatesNestedInput = {
    create?: XOR<CampaignCreateWithoutUpdatesInput, CampaignUncheckedCreateWithoutUpdatesInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutUpdatesInput
    upsert?: CampaignUpsertWithoutUpdatesInput
    connect?: CampaignWhereUniqueInput
    update?: XOR<XOR<CampaignUpdateToOneWithWhereWithoutUpdatesInput, CampaignUpdateWithoutUpdatesInput>, CampaignUncheckedUpdateWithoutUpdatesInput>
  }

  export type RoundCreatetagsInput = {
    set: string[]
  }

  export type RoundCampaignsCreateNestedManyWithoutRoundInput = {
    create?: XOR<RoundCampaignsCreateWithoutRoundInput, RoundCampaignsUncheckedCreateWithoutRoundInput> | RoundCampaignsCreateWithoutRoundInput[] | RoundCampaignsUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutRoundInput | RoundCampaignsCreateOrConnectWithoutRoundInput[]
    createMany?: RoundCampaignsCreateManyRoundInputEnvelope
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
  }

  export type RoundCampaignsUncheckedCreateNestedManyWithoutRoundInput = {
    create?: XOR<RoundCampaignsCreateWithoutRoundInput, RoundCampaignsUncheckedCreateWithoutRoundInput> | RoundCampaignsCreateWithoutRoundInput[] | RoundCampaignsUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutRoundInput | RoundCampaignsCreateOrConnectWithoutRoundInput[]
    createMany?: RoundCampaignsCreateManyRoundInputEnvelope
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type RoundUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type RoundCampaignsUpdateManyWithoutRoundNestedInput = {
    create?: XOR<RoundCampaignsCreateWithoutRoundInput, RoundCampaignsUncheckedCreateWithoutRoundInput> | RoundCampaignsCreateWithoutRoundInput[] | RoundCampaignsUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutRoundInput | RoundCampaignsCreateOrConnectWithoutRoundInput[]
    upsert?: RoundCampaignsUpsertWithWhereUniqueWithoutRoundInput | RoundCampaignsUpsertWithWhereUniqueWithoutRoundInput[]
    createMany?: RoundCampaignsCreateManyRoundInputEnvelope
    set?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    disconnect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    delete?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    update?: RoundCampaignsUpdateWithWhereUniqueWithoutRoundInput | RoundCampaignsUpdateWithWhereUniqueWithoutRoundInput[]
    updateMany?: RoundCampaignsUpdateManyWithWhereWithoutRoundInput | RoundCampaignsUpdateManyWithWhereWithoutRoundInput[]
    deleteMany?: RoundCampaignsScalarWhereInput | RoundCampaignsScalarWhereInput[]
  }

  export type RoundCampaignsUncheckedUpdateManyWithoutRoundNestedInput = {
    create?: XOR<RoundCampaignsCreateWithoutRoundInput, RoundCampaignsUncheckedCreateWithoutRoundInput> | RoundCampaignsCreateWithoutRoundInput[] | RoundCampaignsUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: RoundCampaignsCreateOrConnectWithoutRoundInput | RoundCampaignsCreateOrConnectWithoutRoundInput[]
    upsert?: RoundCampaignsUpsertWithWhereUniqueWithoutRoundInput | RoundCampaignsUpsertWithWhereUniqueWithoutRoundInput[]
    createMany?: RoundCampaignsCreateManyRoundInputEnvelope
    set?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    disconnect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    delete?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    connect?: RoundCampaignsWhereUniqueInput | RoundCampaignsWhereUniqueInput[]
    update?: RoundCampaignsUpdateWithWhereUniqueWithoutRoundInput | RoundCampaignsUpdateWithWhereUniqueWithoutRoundInput[]
    updateMany?: RoundCampaignsUpdateManyWithWhereWithoutRoundInput | RoundCampaignsUpdateManyWithWhereWithoutRoundInput[]
    deleteMany?: RoundCampaignsScalarWhereInput | RoundCampaignsScalarWhereInput[]
  }

  export type CampaignCreateNestedOneWithoutRoundCampaignsInput = {
    create?: XOR<CampaignCreateWithoutRoundCampaignsInput, CampaignUncheckedCreateWithoutRoundCampaignsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutRoundCampaignsInput
    connect?: CampaignWhereUniqueInput
  }

  export type RoundCreateNestedOneWithoutRoundCampaignsInput = {
    create?: XOR<RoundCreateWithoutRoundCampaignsInput, RoundUncheckedCreateWithoutRoundCampaignsInput>
    connectOrCreate?: RoundCreateOrConnectWithoutRoundCampaignsInput
    connect?: RoundWhereUniqueInput
  }

  export type EnumRecipientStatusFieldUpdateOperationsInput = {
    set?: $Enums.RecipientStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type CampaignUpdateOneRequiredWithoutRoundCampaignsNestedInput = {
    create?: XOR<CampaignCreateWithoutRoundCampaignsInput, CampaignUncheckedCreateWithoutRoundCampaignsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutRoundCampaignsInput
    upsert?: CampaignUpsertWithoutRoundCampaignsInput
    connect?: CampaignWhereUniqueInput
    update?: XOR<XOR<CampaignUpdateToOneWithWhereWithoutRoundCampaignsInput, CampaignUpdateWithoutRoundCampaignsInput>, CampaignUncheckedUpdateWithoutRoundCampaignsInput>
  }

  export type RoundUpdateOneRequiredWithoutRoundCampaignsNestedInput = {
    create?: XOR<RoundCreateWithoutRoundCampaignsInput, RoundUncheckedCreateWithoutRoundCampaignsInput>
    connectOrCreate?: RoundCreateOrConnectWithoutRoundCampaignsInput
    upsert?: RoundUpsertWithoutRoundCampaignsInput
    connect?: RoundWhereUniqueInput
    update?: XOR<XOR<RoundUpdateToOneWithWhereWithoutRoundCampaignsInput, RoundUpdateWithoutRoundCampaignsInput>, RoundUncheckedUpdateWithoutRoundCampaignsInput>
  }

  export type UserCreateNestedOneWithoutCollectionsInput = {
    create?: XOR<UserCreateWithoutCollectionsInput, UserUncheckedCreateWithoutCollectionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCollectionsInput
    connect?: UserWhereUniqueInput
  }

  export type CampaignCollectionCreateNestedManyWithoutCollectionInput = {
    create?: XOR<CampaignCollectionCreateWithoutCollectionInput, CampaignCollectionUncheckedCreateWithoutCollectionInput> | CampaignCollectionCreateWithoutCollectionInput[] | CampaignCollectionUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCollectionInput | CampaignCollectionCreateOrConnectWithoutCollectionInput[]
    createMany?: CampaignCollectionCreateManyCollectionInputEnvelope
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
  }

  export type CampaignCollectionUncheckedCreateNestedManyWithoutCollectionInput = {
    create?: XOR<CampaignCollectionCreateWithoutCollectionInput, CampaignCollectionUncheckedCreateWithoutCollectionInput> | CampaignCollectionCreateWithoutCollectionInput[] | CampaignCollectionUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCollectionInput | CampaignCollectionCreateOrConnectWithoutCollectionInput[]
    createMany?: CampaignCollectionCreateManyCollectionInputEnvelope
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutCollectionsNestedInput = {
    create?: XOR<UserCreateWithoutCollectionsInput, UserUncheckedCreateWithoutCollectionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCollectionsInput
    upsert?: UserUpsertWithoutCollectionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCollectionsInput, UserUpdateWithoutCollectionsInput>, UserUncheckedUpdateWithoutCollectionsInput>
  }

  export type CampaignCollectionUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<CampaignCollectionCreateWithoutCollectionInput, CampaignCollectionUncheckedCreateWithoutCollectionInput> | CampaignCollectionCreateWithoutCollectionInput[] | CampaignCollectionUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCollectionInput | CampaignCollectionCreateOrConnectWithoutCollectionInput[]
    upsert?: CampaignCollectionUpsertWithWhereUniqueWithoutCollectionInput | CampaignCollectionUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: CampaignCollectionCreateManyCollectionInputEnvelope
    set?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    disconnect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    delete?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    update?: CampaignCollectionUpdateWithWhereUniqueWithoutCollectionInput | CampaignCollectionUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: CampaignCollectionUpdateManyWithWhereWithoutCollectionInput | CampaignCollectionUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: CampaignCollectionScalarWhereInput | CampaignCollectionScalarWhereInput[]
  }

  export type CampaignCollectionUncheckedUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<CampaignCollectionCreateWithoutCollectionInput, CampaignCollectionUncheckedCreateWithoutCollectionInput> | CampaignCollectionCreateWithoutCollectionInput[] | CampaignCollectionUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CampaignCollectionCreateOrConnectWithoutCollectionInput | CampaignCollectionCreateOrConnectWithoutCollectionInput[]
    upsert?: CampaignCollectionUpsertWithWhereUniqueWithoutCollectionInput | CampaignCollectionUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: CampaignCollectionCreateManyCollectionInputEnvelope
    set?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    disconnect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    delete?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    connect?: CampaignCollectionWhereUniqueInput | CampaignCollectionWhereUniqueInput[]
    update?: CampaignCollectionUpdateWithWhereUniqueWithoutCollectionInput | CampaignCollectionUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: CampaignCollectionUpdateManyWithWhereWithoutCollectionInput | CampaignCollectionUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: CampaignCollectionScalarWhereInput | CampaignCollectionScalarWhereInput[]
  }

  export type CampaignCreateNestedOneWithoutCollectionsInput = {
    create?: XOR<CampaignCreateWithoutCollectionsInput, CampaignUncheckedCreateWithoutCollectionsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutCollectionsInput
    connect?: CampaignWhereUniqueInput
  }

  export type CollectionCreateNestedOneWithoutCampaignsInput = {
    create?: XOR<CollectionCreateWithoutCampaignsInput, CollectionUncheckedCreateWithoutCampaignsInput>
    connectOrCreate?: CollectionCreateOrConnectWithoutCampaignsInput
    connect?: CollectionWhereUniqueInput
  }

  export type CampaignUpdateOneRequiredWithoutCollectionsNestedInput = {
    create?: XOR<CampaignCreateWithoutCollectionsInput, CampaignUncheckedCreateWithoutCollectionsInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutCollectionsInput
    upsert?: CampaignUpsertWithoutCollectionsInput
    connect?: CampaignWhereUniqueInput
    update?: XOR<XOR<CampaignUpdateToOneWithWhereWithoutCollectionsInput, CampaignUpdateWithoutCollectionsInput>, CampaignUncheckedUpdateWithoutCollectionsInput>
  }

  export type CollectionUpdateOneRequiredWithoutCampaignsNestedInput = {
    create?: XOR<CollectionCreateWithoutCampaignsInput, CollectionUncheckedCreateWithoutCampaignsInput>
    connectOrCreate?: CollectionCreateOrConnectWithoutCampaignsInput
    upsert?: CollectionUpsertWithoutCampaignsInput
    connect?: CollectionWhereUniqueInput
    update?: XOR<XOR<CollectionUpdateToOneWithWhereWithoutCampaignsInput, CollectionUpdateWithoutCampaignsInput>, CollectionUncheckedUpdateWithoutCampaignsInput>
  }

  export type CampaignCreateNestedOneWithoutFavoritesInput = {
    create?: XOR<CampaignCreateWithoutFavoritesInput, CampaignUncheckedCreateWithoutFavoritesInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutFavoritesInput
    connect?: CampaignWhereUniqueInput
  }

  export type CampaignUpdateOneRequiredWithoutFavoritesNestedInput = {
    create?: XOR<CampaignCreateWithoutFavoritesInput, CampaignUncheckedCreateWithoutFavoritesInput>
    connectOrCreate?: CampaignCreateOrConnectWithoutFavoritesInput
    upsert?: CampaignUpsertWithoutFavoritesInput
    connect?: CampaignWhereUniqueInput
    update?: XOR<XOR<CampaignUpdateToOneWithWhereWithoutFavoritesInput, CampaignUpdateWithoutFavoritesInput>, CampaignUncheckedUpdateWithoutFavoritesInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedEnumCampaignStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusFilter<$PrismaModel> | $Enums.CampaignStatus
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumCampaignStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusWithAggregatesFilter<$PrismaModel> | $Enums.CampaignStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCampaignStatusFilter<$PrismaModel>
    _max?: NestedEnumCampaignStatusFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedEnumRecipientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientStatus | EnumRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientStatusFilter<$PrismaModel> | $Enums.RecipientStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumRecipientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientStatus | EnumRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientStatus[] | ListEnumRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientStatusWithAggregatesFilter<$PrismaModel> | $Enums.RecipientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRecipientStatusFilter<$PrismaModel>
    _max?: NestedEnumRecipientStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CampaignImageCreateWithoutCampaignInput = {
    imageUrl: string
    isMainImage?: boolean
  }

  export type CampaignImageUncheckedCreateWithoutCampaignInput = {
    id?: number
    imageUrl: string
    isMainImage?: boolean
  }

  export type CampaignImageCreateOrConnectWithoutCampaignInput = {
    where: CampaignImageWhereUniqueInput
    create: XOR<CampaignImageCreateWithoutCampaignInput, CampaignImageUncheckedCreateWithoutCampaignInput>
  }

  export type CampaignImageCreateManyCampaignInputEnvelope = {
    data: CampaignImageCreateManyCampaignInput | CampaignImageCreateManyCampaignInput[]
    skipDuplicates?: boolean
  }

  export type CampaignUpdateCreateWithoutCampaignInput = {
    title: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    creatorAddress: string
  }

  export type CampaignUpdateUncheckedCreateWithoutCampaignInput = {
    id?: number
    title: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    creatorAddress: string
  }

  export type CampaignUpdateCreateOrConnectWithoutCampaignInput = {
    where: CampaignUpdateWhereUniqueInput
    create: XOR<CampaignUpdateCreateWithoutCampaignInput, CampaignUpdateUncheckedCreateWithoutCampaignInput>
  }

  export type CampaignUpdateCreateManyCampaignInputEnvelope = {
    data: CampaignUpdateCreateManyCampaignInput | CampaignUpdateCreateManyCampaignInput[]
    skipDuplicates?: boolean
  }

  export type CommentCreateWithoutCampaignInput = {
    content: string
    userAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentUncheckedCreateWithoutCampaignInput = {
    id?: number
    content: string
    userAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentCreateOrConnectWithoutCampaignInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutCampaignInput, CommentUncheckedCreateWithoutCampaignInput>
  }

  export type CommentCreateManyCampaignInputEnvelope = {
    data: CommentCreateManyCampaignInput | CommentCreateManyCampaignInput[]
    skipDuplicates?: boolean
  }

  export type PaymentCreateWithoutCampaignInput = {
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPaymentsInput
  }

  export type PaymentUncheckedCreateWithoutCampaignInput = {
    id?: number
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
  }

  export type PaymentCreateOrConnectWithoutCampaignInput = {
    where: PaymentWhereUniqueInput
    create: XOR<PaymentCreateWithoutCampaignInput, PaymentUncheckedCreateWithoutCampaignInput>
  }

  export type PaymentCreateManyCampaignInputEnvelope = {
    data: PaymentCreateManyCampaignInput | PaymentCreateManyCampaignInput[]
    skipDuplicates?: boolean
  }

  export type RoundCampaignsCreateWithoutCampaignInput = {
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
    Round: RoundCreateNestedOneWithoutRoundCampaignsInput
  }

  export type RoundCampaignsUncheckedCreateWithoutCampaignInput = {
    id?: number
    roundId: number
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
  }

  export type RoundCampaignsCreateOrConnectWithoutCampaignInput = {
    where: RoundCampaignsWhereUniqueInput
    create: XOR<RoundCampaignsCreateWithoutCampaignInput, RoundCampaignsUncheckedCreateWithoutCampaignInput>
  }

  export type RoundCampaignsCreateManyCampaignInputEnvelope = {
    data: RoundCampaignsCreateManyCampaignInput | RoundCampaignsCreateManyCampaignInput[]
    skipDuplicates?: boolean
  }

  export type CampaignCollectionCreateWithoutCampaignInput = {
    assignedAt?: Date | string
    collection: CollectionCreateNestedOneWithoutCampaignsInput
  }

  export type CampaignCollectionUncheckedCreateWithoutCampaignInput = {
    collectionId: string
    assignedAt?: Date | string
  }

  export type CampaignCollectionCreateOrConnectWithoutCampaignInput = {
    where: CampaignCollectionWhereUniqueInput
    create: XOR<CampaignCollectionCreateWithoutCampaignInput, CampaignCollectionUncheckedCreateWithoutCampaignInput>
  }

  export type CampaignCollectionCreateManyCampaignInputEnvelope = {
    data: CampaignCollectionCreateManyCampaignInput | CampaignCollectionCreateManyCampaignInput[]
    skipDuplicates?: boolean
  }

  export type FavoriteCreateWithoutCampaignInput = {
    userAddress: string
    createdAt?: Date | string
  }

  export type FavoriteUncheckedCreateWithoutCampaignInput = {
    id?: number
    userAddress: string
    createdAt?: Date | string
  }

  export type FavoriteCreateOrConnectWithoutCampaignInput = {
    where: FavoriteWhereUniqueInput
    create: XOR<FavoriteCreateWithoutCampaignInput, FavoriteUncheckedCreateWithoutCampaignInput>
  }

  export type FavoriteCreateManyCampaignInputEnvelope = {
    data: FavoriteCreateManyCampaignInput | FavoriteCreateManyCampaignInput[]
    skipDuplicates?: boolean
  }

  export type CampaignImageUpsertWithWhereUniqueWithoutCampaignInput = {
    where: CampaignImageWhereUniqueInput
    update: XOR<CampaignImageUpdateWithoutCampaignInput, CampaignImageUncheckedUpdateWithoutCampaignInput>
    create: XOR<CampaignImageCreateWithoutCampaignInput, CampaignImageUncheckedCreateWithoutCampaignInput>
  }

  export type CampaignImageUpdateWithWhereUniqueWithoutCampaignInput = {
    where: CampaignImageWhereUniqueInput
    data: XOR<CampaignImageUpdateWithoutCampaignInput, CampaignImageUncheckedUpdateWithoutCampaignInput>
  }

  export type CampaignImageUpdateManyWithWhereWithoutCampaignInput = {
    where: CampaignImageScalarWhereInput
    data: XOR<CampaignImageUpdateManyMutationInput, CampaignImageUncheckedUpdateManyWithoutCampaignInput>
  }

  export type CampaignImageScalarWhereInput = {
    AND?: CampaignImageScalarWhereInput | CampaignImageScalarWhereInput[]
    OR?: CampaignImageScalarWhereInput[]
    NOT?: CampaignImageScalarWhereInput | CampaignImageScalarWhereInput[]
    id?: IntFilter<"CampaignImage"> | number
    imageUrl?: StringFilter<"CampaignImage"> | string
    isMainImage?: BoolFilter<"CampaignImage"> | boolean
    campaignId?: IntFilter<"CampaignImage"> | number
  }

  export type CampaignUpdateUpsertWithWhereUniqueWithoutCampaignInput = {
    where: CampaignUpdateWhereUniqueInput
    update: XOR<CampaignUpdateUpdateWithoutCampaignInput, CampaignUpdateUncheckedUpdateWithoutCampaignInput>
    create: XOR<CampaignUpdateCreateWithoutCampaignInput, CampaignUpdateUncheckedCreateWithoutCampaignInput>
  }

  export type CampaignUpdateUpdateWithWhereUniqueWithoutCampaignInput = {
    where: CampaignUpdateWhereUniqueInput
    data: XOR<CampaignUpdateUpdateWithoutCampaignInput, CampaignUpdateUncheckedUpdateWithoutCampaignInput>
  }

  export type CampaignUpdateUpdateManyWithWhereWithoutCampaignInput = {
    where: CampaignUpdateScalarWhereInput
    data: XOR<CampaignUpdateUpdateManyMutationInput, CampaignUpdateUncheckedUpdateManyWithoutCampaignInput>
  }

  export type CampaignUpdateScalarWhereInput = {
    AND?: CampaignUpdateScalarWhereInput | CampaignUpdateScalarWhereInput[]
    OR?: CampaignUpdateScalarWhereInput[]
    NOT?: CampaignUpdateScalarWhereInput | CampaignUpdateScalarWhereInput[]
    id?: IntFilter<"CampaignUpdate"> | number
    title?: StringFilter<"CampaignUpdate"> | string
    content?: StringFilter<"CampaignUpdate"> | string
    createdAt?: DateTimeFilter<"CampaignUpdate"> | Date | string
    updatedAt?: DateTimeFilter<"CampaignUpdate"> | Date | string
    campaignId?: IntFilter<"CampaignUpdate"> | number
    creatorAddress?: StringFilter<"CampaignUpdate"> | string
  }

  export type CommentUpsertWithWhereUniqueWithoutCampaignInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutCampaignInput, CommentUncheckedUpdateWithoutCampaignInput>
    create: XOR<CommentCreateWithoutCampaignInput, CommentUncheckedCreateWithoutCampaignInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutCampaignInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutCampaignInput, CommentUncheckedUpdateWithoutCampaignInput>
  }

  export type CommentUpdateManyWithWhereWithoutCampaignInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutCampaignInput>
  }

  export type CommentScalarWhereInput = {
    AND?: CommentScalarWhereInput | CommentScalarWhereInput[]
    OR?: CommentScalarWhereInput[]
    NOT?: CommentScalarWhereInput | CommentScalarWhereInput[]
    id?: IntFilter<"Comment"> | number
    content?: StringFilter<"Comment"> | string
    userAddress?: StringFilter<"Comment"> | string
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    campaignId?: IntFilter<"Comment"> | number
  }

  export type PaymentUpsertWithWhereUniqueWithoutCampaignInput = {
    where: PaymentWhereUniqueInput
    update: XOR<PaymentUpdateWithoutCampaignInput, PaymentUncheckedUpdateWithoutCampaignInput>
    create: XOR<PaymentCreateWithoutCampaignInput, PaymentUncheckedCreateWithoutCampaignInput>
  }

  export type PaymentUpdateWithWhereUniqueWithoutCampaignInput = {
    where: PaymentWhereUniqueInput
    data: XOR<PaymentUpdateWithoutCampaignInput, PaymentUncheckedUpdateWithoutCampaignInput>
  }

  export type PaymentUpdateManyWithWhereWithoutCampaignInput = {
    where: PaymentScalarWhereInput
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyWithoutCampaignInput>
  }

  export type PaymentScalarWhereInput = {
    AND?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    OR?: PaymentScalarWhereInput[]
    NOT?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    id?: IntFilter<"Payment"> | number
    amount?: StringFilter<"Payment"> | string
    token?: StringFilter<"Payment"> | string
    status?: StringFilter<"Payment"> | string
    transactionHash?: StringNullableFilter<"Payment"> | string | null
    isAnonymous?: BoolFilter<"Payment"> | boolean
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
    campaignId?: IntFilter<"Payment"> | number
    userId?: IntFilter<"Payment"> | number
  }

  export type RoundCampaignsUpsertWithWhereUniqueWithoutCampaignInput = {
    where: RoundCampaignsWhereUniqueInput
    update: XOR<RoundCampaignsUpdateWithoutCampaignInput, RoundCampaignsUncheckedUpdateWithoutCampaignInput>
    create: XOR<RoundCampaignsCreateWithoutCampaignInput, RoundCampaignsUncheckedCreateWithoutCampaignInput>
  }

  export type RoundCampaignsUpdateWithWhereUniqueWithoutCampaignInput = {
    where: RoundCampaignsWhereUniqueInput
    data: XOR<RoundCampaignsUpdateWithoutCampaignInput, RoundCampaignsUncheckedUpdateWithoutCampaignInput>
  }

  export type RoundCampaignsUpdateManyWithWhereWithoutCampaignInput = {
    where: RoundCampaignsScalarWhereInput
    data: XOR<RoundCampaignsUpdateManyMutationInput, RoundCampaignsUncheckedUpdateManyWithoutCampaignInput>
  }

  export type RoundCampaignsScalarWhereInput = {
    AND?: RoundCampaignsScalarWhereInput | RoundCampaignsScalarWhereInput[]
    OR?: RoundCampaignsScalarWhereInput[]
    NOT?: RoundCampaignsScalarWhereInput | RoundCampaignsScalarWhereInput[]
    id?: IntFilter<"RoundCampaigns"> | number
    roundId?: IntFilter<"RoundCampaigns"> | number
    campaignId?: IntFilter<"RoundCampaigns"> | number
    status?: EnumRecipientStatusFilter<"RoundCampaigns"> | $Enums.RecipientStatus
    recipientAddress?: StringNullableFilter<"RoundCampaigns"> | string | null
    submittedByWalletAddress?: StringNullableFilter<"RoundCampaigns"> | string | null
    txHash?: StringNullableFilter<"RoundCampaigns"> | string | null
    onchainRecipientId?: StringNullableFilter<"RoundCampaigns"> | string | null
    reviewedAt?: DateTimeNullableFilter<"RoundCampaigns"> | Date | string | null
  }

  export type CampaignCollectionUpsertWithWhereUniqueWithoutCampaignInput = {
    where: CampaignCollectionWhereUniqueInput
    update: XOR<CampaignCollectionUpdateWithoutCampaignInput, CampaignCollectionUncheckedUpdateWithoutCampaignInput>
    create: XOR<CampaignCollectionCreateWithoutCampaignInput, CampaignCollectionUncheckedCreateWithoutCampaignInput>
  }

  export type CampaignCollectionUpdateWithWhereUniqueWithoutCampaignInput = {
    where: CampaignCollectionWhereUniqueInput
    data: XOR<CampaignCollectionUpdateWithoutCampaignInput, CampaignCollectionUncheckedUpdateWithoutCampaignInput>
  }

  export type CampaignCollectionUpdateManyWithWhereWithoutCampaignInput = {
    where: CampaignCollectionScalarWhereInput
    data: XOR<CampaignCollectionUpdateManyMutationInput, CampaignCollectionUncheckedUpdateManyWithoutCampaignInput>
  }

  export type CampaignCollectionScalarWhereInput = {
    AND?: CampaignCollectionScalarWhereInput | CampaignCollectionScalarWhereInput[]
    OR?: CampaignCollectionScalarWhereInput[]
    NOT?: CampaignCollectionScalarWhereInput | CampaignCollectionScalarWhereInput[]
    campaignId?: IntFilter<"CampaignCollection"> | number
    collectionId?: StringFilter<"CampaignCollection"> | string
    assignedAt?: DateTimeFilter<"CampaignCollection"> | Date | string
  }

  export type FavoriteUpsertWithWhereUniqueWithoutCampaignInput = {
    where: FavoriteWhereUniqueInput
    update: XOR<FavoriteUpdateWithoutCampaignInput, FavoriteUncheckedUpdateWithoutCampaignInput>
    create: XOR<FavoriteCreateWithoutCampaignInput, FavoriteUncheckedCreateWithoutCampaignInput>
  }

  export type FavoriteUpdateWithWhereUniqueWithoutCampaignInput = {
    where: FavoriteWhereUniqueInput
    data: XOR<FavoriteUpdateWithoutCampaignInput, FavoriteUncheckedUpdateWithoutCampaignInput>
  }

  export type FavoriteUpdateManyWithWhereWithoutCampaignInput = {
    where: FavoriteScalarWhereInput
    data: XOR<FavoriteUpdateManyMutationInput, FavoriteUncheckedUpdateManyWithoutCampaignInput>
  }

  export type FavoriteScalarWhereInput = {
    AND?: FavoriteScalarWhereInput | FavoriteScalarWhereInput[]
    OR?: FavoriteScalarWhereInput[]
    NOT?: FavoriteScalarWhereInput | FavoriteScalarWhereInput[]
    id?: IntFilter<"Favorite"> | number
    userAddress?: StringFilter<"Favorite"> | string
    campaignId?: IntFilter<"Favorite"> | number
    createdAt?: DateTimeFilter<"Favorite"> | Date | string
  }

  export type CampaignCreateWithoutImagesInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    updates?: CampaignUpdateCreateNestedManyWithoutCampaignInput
    comments?: CommentCreateNestedManyWithoutCampaignInput
    payments?: PaymentCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateWithoutImagesInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    updates?: CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput
    comments?: CommentUncheckedCreateNestedManyWithoutCampaignInput
    payments?: PaymentUncheckedCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignCreateOrConnectWithoutImagesInput = {
    where: CampaignWhereUniqueInput
    create: XOR<CampaignCreateWithoutImagesInput, CampaignUncheckedCreateWithoutImagesInput>
  }

  export type CampaignUpsertWithoutImagesInput = {
    update: XOR<CampaignUpdateWithoutImagesInput, CampaignUncheckedUpdateWithoutImagesInput>
    create: XOR<CampaignCreateWithoutImagesInput, CampaignUncheckedCreateWithoutImagesInput>
    where?: CampaignWhereInput
  }

  export type CampaignUpdateToOneWithWhereWithoutImagesInput = {
    where?: CampaignWhereInput
    data: XOR<CampaignUpdateWithoutImagesInput, CampaignUncheckedUpdateWithoutImagesInput>
  }

  export type CampaignUpdateWithoutImagesInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    updates?: CampaignUpdateUpdateManyWithoutCampaignNestedInput
    comments?: CommentUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateWithoutImagesInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    updates?: CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput
    comments?: CommentUncheckedUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type PaymentCreateWithoutUserInput = {
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    campaign: CampaignCreateNestedOneWithoutPaymentsInput
  }

  export type PaymentUncheckedCreateWithoutUserInput = {
    id?: number
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
  }

  export type PaymentCreateOrConnectWithoutUserInput = {
    where: PaymentWhereUniqueInput
    create: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
  }

  export type PaymentCreateManyUserInputEnvelope = {
    data: PaymentCreateManyUserInput | PaymentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CollectionCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaigns?: CampaignCollectionCreateNestedManyWithoutCollectionInput
  }

  export type CollectionUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaigns?: CampaignCollectionUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type CollectionCreateOrConnectWithoutUserInput = {
    where: CollectionWhereUniqueInput
    create: XOR<CollectionCreateWithoutUserInput, CollectionUncheckedCreateWithoutUserInput>
  }

  export type CollectionCreateManyUserInputEnvelope = {
    data: CollectionCreateManyUserInput | CollectionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PaymentUpsertWithWhereUniqueWithoutUserInput = {
    where: PaymentWhereUniqueInput
    update: XOR<PaymentUpdateWithoutUserInput, PaymentUncheckedUpdateWithoutUserInput>
    create: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
  }

  export type PaymentUpdateWithWhereUniqueWithoutUserInput = {
    where: PaymentWhereUniqueInput
    data: XOR<PaymentUpdateWithoutUserInput, PaymentUncheckedUpdateWithoutUserInput>
  }

  export type PaymentUpdateManyWithWhereWithoutUserInput = {
    where: PaymentScalarWhereInput
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyWithoutUserInput>
  }

  export type CollectionUpsertWithWhereUniqueWithoutUserInput = {
    where: CollectionWhereUniqueInput
    update: XOR<CollectionUpdateWithoutUserInput, CollectionUncheckedUpdateWithoutUserInput>
    create: XOR<CollectionCreateWithoutUserInput, CollectionUncheckedCreateWithoutUserInput>
  }

  export type CollectionUpdateWithWhereUniqueWithoutUserInput = {
    where: CollectionWhereUniqueInput
    data: XOR<CollectionUpdateWithoutUserInput, CollectionUncheckedUpdateWithoutUserInput>
  }

  export type CollectionUpdateManyWithWhereWithoutUserInput = {
    where: CollectionScalarWhereInput
    data: XOR<CollectionUpdateManyMutationInput, CollectionUncheckedUpdateManyWithoutUserInput>
  }

  export type CollectionScalarWhereInput = {
    AND?: CollectionScalarWhereInput | CollectionScalarWhereInput[]
    OR?: CollectionScalarWhereInput[]
    NOT?: CollectionScalarWhereInput | CollectionScalarWhereInput[]
    id?: StringFilter<"Collection"> | string
    name?: StringFilter<"Collection"> | string
    description?: StringNullableFilter<"Collection"> | string | null
    createdAt?: DateTimeFilter<"Collection"> | Date | string
    updatedAt?: DateTimeFilter<"Collection"> | Date | string
    userId?: StringFilter<"Collection"> | string
  }

  export type CampaignCreateWithoutPaymentsInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateCreateNestedManyWithoutCampaignInput
    comments?: CommentCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateWithoutPaymentsInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageUncheckedCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput
    comments?: CommentUncheckedCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignCreateOrConnectWithoutPaymentsInput = {
    where: CampaignWhereUniqueInput
    create: XOR<CampaignCreateWithoutPaymentsInput, CampaignUncheckedCreateWithoutPaymentsInput>
  }

  export type UserCreateWithoutPaymentsInput = {
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    collections?: CollectionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPaymentsInput = {
    id?: number
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    collections?: CollectionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPaymentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
  }

  export type CampaignUpsertWithoutPaymentsInput = {
    update: XOR<CampaignUpdateWithoutPaymentsInput, CampaignUncheckedUpdateWithoutPaymentsInput>
    create: XOR<CampaignCreateWithoutPaymentsInput, CampaignUncheckedCreateWithoutPaymentsInput>
    where?: CampaignWhereInput
  }

  export type CampaignUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: CampaignWhereInput
    data: XOR<CampaignUpdateWithoutPaymentsInput, CampaignUncheckedUpdateWithoutPaymentsInput>
  }

  export type CampaignUpdateWithoutPaymentsInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUpdateManyWithoutCampaignNestedInput
    comments?: CommentUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateWithoutPaymentsInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput
    comments?: CommentUncheckedUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type UserUpsertWithoutPaymentsInput = {
    update: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type UserUpdateWithoutPaymentsInput = {
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collections?: CollectionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPaymentsInput = {
    id?: IntFieldUpdateOperationsInput | number
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collections?: CollectionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CampaignCreateWithoutCommentsInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateCreateNestedManyWithoutCampaignInput
    payments?: PaymentCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateWithoutCommentsInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageUncheckedCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput
    payments?: PaymentUncheckedCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignCreateOrConnectWithoutCommentsInput = {
    where: CampaignWhereUniqueInput
    create: XOR<CampaignCreateWithoutCommentsInput, CampaignUncheckedCreateWithoutCommentsInput>
  }

  export type CampaignUpsertWithoutCommentsInput = {
    update: XOR<CampaignUpdateWithoutCommentsInput, CampaignUncheckedUpdateWithoutCommentsInput>
    create: XOR<CampaignCreateWithoutCommentsInput, CampaignUncheckedCreateWithoutCommentsInput>
    where?: CampaignWhereInput
  }

  export type CampaignUpdateToOneWithWhereWithoutCommentsInput = {
    where?: CampaignWhereInput
    data: XOR<CampaignUpdateWithoutCommentsInput, CampaignUncheckedUpdateWithoutCommentsInput>
  }

  export type CampaignUpdateWithoutCommentsInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateWithoutCommentsInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignCreateWithoutUpdatesInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageCreateNestedManyWithoutCampaignInput
    comments?: CommentCreateNestedManyWithoutCampaignInput
    payments?: PaymentCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateWithoutUpdatesInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageUncheckedCreateNestedManyWithoutCampaignInput
    comments?: CommentUncheckedCreateNestedManyWithoutCampaignInput
    payments?: PaymentUncheckedCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignCreateOrConnectWithoutUpdatesInput = {
    where: CampaignWhereUniqueInput
    create: XOR<CampaignCreateWithoutUpdatesInput, CampaignUncheckedCreateWithoutUpdatesInput>
  }

  export type CampaignUpsertWithoutUpdatesInput = {
    update: XOR<CampaignUpdateWithoutUpdatesInput, CampaignUncheckedUpdateWithoutUpdatesInput>
    create: XOR<CampaignCreateWithoutUpdatesInput, CampaignUncheckedCreateWithoutUpdatesInput>
    where?: CampaignWhereInput
  }

  export type CampaignUpdateToOneWithWhereWithoutUpdatesInput = {
    where?: CampaignWhereInput
    data: XOR<CampaignUpdateWithoutUpdatesInput, CampaignUncheckedUpdateWithoutUpdatesInput>
  }

  export type CampaignUpdateWithoutUpdatesInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUpdateManyWithoutCampaignNestedInput
    comments?: CommentUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateWithoutUpdatesInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput
    comments?: CommentUncheckedUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type RoundCampaignsCreateWithoutRoundInput = {
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
    Campaign: CampaignCreateNestedOneWithoutRoundCampaignsInput
  }

  export type RoundCampaignsUncheckedCreateWithoutRoundInput = {
    id?: number
    campaignId: number
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
  }

  export type RoundCampaignsCreateOrConnectWithoutRoundInput = {
    where: RoundCampaignsWhereUniqueInput
    create: XOR<RoundCampaignsCreateWithoutRoundInput, RoundCampaignsUncheckedCreateWithoutRoundInput>
  }

  export type RoundCampaignsCreateManyRoundInputEnvelope = {
    data: RoundCampaignsCreateManyRoundInput | RoundCampaignsCreateManyRoundInput[]
    skipDuplicates?: boolean
  }

  export type RoundCampaignsUpsertWithWhereUniqueWithoutRoundInput = {
    where: RoundCampaignsWhereUniqueInput
    update: XOR<RoundCampaignsUpdateWithoutRoundInput, RoundCampaignsUncheckedUpdateWithoutRoundInput>
    create: XOR<RoundCampaignsCreateWithoutRoundInput, RoundCampaignsUncheckedCreateWithoutRoundInput>
  }

  export type RoundCampaignsUpdateWithWhereUniqueWithoutRoundInput = {
    where: RoundCampaignsWhereUniqueInput
    data: XOR<RoundCampaignsUpdateWithoutRoundInput, RoundCampaignsUncheckedUpdateWithoutRoundInput>
  }

  export type RoundCampaignsUpdateManyWithWhereWithoutRoundInput = {
    where: RoundCampaignsScalarWhereInput
    data: XOR<RoundCampaignsUpdateManyMutationInput, RoundCampaignsUncheckedUpdateManyWithoutRoundInput>
  }

  export type CampaignCreateWithoutRoundCampaignsInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateCreateNestedManyWithoutCampaignInput
    comments?: CommentCreateNestedManyWithoutCampaignInput
    payments?: PaymentCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateWithoutRoundCampaignsInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageUncheckedCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput
    comments?: CommentUncheckedCreateNestedManyWithoutCampaignInput
    payments?: PaymentUncheckedCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignCreateOrConnectWithoutRoundCampaignsInput = {
    where: CampaignWhereUniqueInput
    create: XOR<CampaignCreateWithoutRoundCampaignsInput, CampaignUncheckedCreateWithoutRoundCampaignsInput>
  }

  export type RoundCreateWithoutRoundCampaignsInput = {
    poolId?: bigint | number | null
    strategyAddress: string
    profileId: string
    managerAddress: string
    transactionHash?: string | null
    title: string
    description: string
    tags?: RoundCreatetagsInput | string[]
    matchingPool: Decimal | DecimalJsLike | number | string
    tokenAddress: string
    tokenDecimals: number
    applicationStart: Date | string
    applicationClose: Date | string
    startDate: Date | string
    endDate: Date | string
    blockchain: string
    logoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RoundUncheckedCreateWithoutRoundCampaignsInput = {
    id?: number
    poolId?: bigint | number | null
    strategyAddress: string
    profileId: string
    managerAddress: string
    transactionHash?: string | null
    title: string
    description: string
    tags?: RoundCreatetagsInput | string[]
    matchingPool: Decimal | DecimalJsLike | number | string
    tokenAddress: string
    tokenDecimals: number
    applicationStart: Date | string
    applicationClose: Date | string
    startDate: Date | string
    endDate: Date | string
    blockchain: string
    logoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RoundCreateOrConnectWithoutRoundCampaignsInput = {
    where: RoundWhereUniqueInput
    create: XOR<RoundCreateWithoutRoundCampaignsInput, RoundUncheckedCreateWithoutRoundCampaignsInput>
  }

  export type CampaignUpsertWithoutRoundCampaignsInput = {
    update: XOR<CampaignUpdateWithoutRoundCampaignsInput, CampaignUncheckedUpdateWithoutRoundCampaignsInput>
    create: XOR<CampaignCreateWithoutRoundCampaignsInput, CampaignUncheckedCreateWithoutRoundCampaignsInput>
    where?: CampaignWhereInput
  }

  export type CampaignUpdateToOneWithWhereWithoutRoundCampaignsInput = {
    where?: CampaignWhereInput
    data: XOR<CampaignUpdateWithoutRoundCampaignsInput, CampaignUncheckedUpdateWithoutRoundCampaignsInput>
  }

  export type CampaignUpdateWithoutRoundCampaignsInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUpdateManyWithoutCampaignNestedInput
    comments?: CommentUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateWithoutRoundCampaignsInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput
    comments?: CommentUncheckedUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type RoundUpsertWithoutRoundCampaignsInput = {
    update: XOR<RoundUpdateWithoutRoundCampaignsInput, RoundUncheckedUpdateWithoutRoundCampaignsInput>
    create: XOR<RoundCreateWithoutRoundCampaignsInput, RoundUncheckedCreateWithoutRoundCampaignsInput>
    where?: RoundWhereInput
  }

  export type RoundUpdateToOneWithWhereWithoutRoundCampaignsInput = {
    where?: RoundWhereInput
    data: XOR<RoundUpdateWithoutRoundCampaignsInput, RoundUncheckedUpdateWithoutRoundCampaignsInput>
  }

  export type RoundUpdateWithoutRoundCampaignsInput = {
    poolId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    strategyAddress?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    managerAddress?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    tags?: RoundUpdatetagsInput | string[]
    matchingPool?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFieldUpdateOperationsInput | string
    tokenDecimals?: IntFieldUpdateOperationsInput | number
    applicationStart?: DateTimeFieldUpdateOperationsInput | Date | string
    applicationClose?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    blockchain?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoundUncheckedUpdateWithoutRoundCampaignsInput = {
    id?: IntFieldUpdateOperationsInput | number
    poolId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    strategyAddress?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    managerAddress?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    tags?: RoundUpdatetagsInput | string[]
    matchingPool?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tokenAddress?: StringFieldUpdateOperationsInput | string
    tokenDecimals?: IntFieldUpdateOperationsInput | number
    applicationStart?: DateTimeFieldUpdateOperationsInput | Date | string
    applicationClose?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    blockchain?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutCollectionsInput = {
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: PaymentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCollectionsInput = {
    id?: number
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCollectionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCollectionsInput, UserUncheckedCreateWithoutCollectionsInput>
  }

  export type CampaignCollectionCreateWithoutCollectionInput = {
    assignedAt?: Date | string
    campaign: CampaignCreateNestedOneWithoutCollectionsInput
  }

  export type CampaignCollectionUncheckedCreateWithoutCollectionInput = {
    campaignId: number
    assignedAt?: Date | string
  }

  export type CampaignCollectionCreateOrConnectWithoutCollectionInput = {
    where: CampaignCollectionWhereUniqueInput
    create: XOR<CampaignCollectionCreateWithoutCollectionInput, CampaignCollectionUncheckedCreateWithoutCollectionInput>
  }

  export type CampaignCollectionCreateManyCollectionInputEnvelope = {
    data: CampaignCollectionCreateManyCollectionInput | CampaignCollectionCreateManyCollectionInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutCollectionsInput = {
    update: XOR<UserUpdateWithoutCollectionsInput, UserUncheckedUpdateWithoutCollectionsInput>
    create: XOR<UserCreateWithoutCollectionsInput, UserUncheckedCreateWithoutCollectionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCollectionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCollectionsInput, UserUncheckedUpdateWithoutCollectionsInput>
  }

  export type UserUpdateWithoutCollectionsInput = {
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: PaymentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCollectionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CampaignCollectionUpsertWithWhereUniqueWithoutCollectionInput = {
    where: CampaignCollectionWhereUniqueInput
    update: XOR<CampaignCollectionUpdateWithoutCollectionInput, CampaignCollectionUncheckedUpdateWithoutCollectionInput>
    create: XOR<CampaignCollectionCreateWithoutCollectionInput, CampaignCollectionUncheckedCreateWithoutCollectionInput>
  }

  export type CampaignCollectionUpdateWithWhereUniqueWithoutCollectionInput = {
    where: CampaignCollectionWhereUniqueInput
    data: XOR<CampaignCollectionUpdateWithoutCollectionInput, CampaignCollectionUncheckedUpdateWithoutCollectionInput>
  }

  export type CampaignCollectionUpdateManyWithWhereWithoutCollectionInput = {
    where: CampaignCollectionScalarWhereInput
    data: XOR<CampaignCollectionUpdateManyMutationInput, CampaignCollectionUncheckedUpdateManyWithoutCollectionInput>
  }

  export type CampaignCreateWithoutCollectionsInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateCreateNestedManyWithoutCampaignInput
    comments?: CommentCreateNestedManyWithoutCampaignInput
    payments?: PaymentCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateWithoutCollectionsInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageUncheckedCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput
    comments?: CommentUncheckedCreateNestedManyWithoutCampaignInput
    payments?: PaymentUncheckedCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput
    favorites?: FavoriteUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignCreateOrConnectWithoutCollectionsInput = {
    where: CampaignWhereUniqueInput
    create: XOR<CampaignCreateWithoutCollectionsInput, CampaignUncheckedCreateWithoutCollectionsInput>
  }

  export type CollectionCreateWithoutCampaignsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCollectionsInput
  }

  export type CollectionUncheckedCreateWithoutCampaignsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type CollectionCreateOrConnectWithoutCampaignsInput = {
    where: CollectionWhereUniqueInput
    create: XOR<CollectionCreateWithoutCampaignsInput, CollectionUncheckedCreateWithoutCampaignsInput>
  }

  export type CampaignUpsertWithoutCollectionsInput = {
    update: XOR<CampaignUpdateWithoutCollectionsInput, CampaignUncheckedUpdateWithoutCollectionsInput>
    create: XOR<CampaignCreateWithoutCollectionsInput, CampaignUncheckedCreateWithoutCollectionsInput>
    where?: CampaignWhereInput
  }

  export type CampaignUpdateToOneWithWhereWithoutCollectionsInput = {
    where?: CampaignWhereInput
    data: XOR<CampaignUpdateWithoutCollectionsInput, CampaignUncheckedUpdateWithoutCollectionsInput>
  }

  export type CampaignUpdateWithoutCollectionsInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUpdateManyWithoutCampaignNestedInput
    comments?: CommentUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateWithoutCollectionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput
    comments?: CommentUncheckedUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput
    favorites?: FavoriteUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type CollectionUpsertWithoutCampaignsInput = {
    update: XOR<CollectionUpdateWithoutCampaignsInput, CollectionUncheckedUpdateWithoutCampaignsInput>
    create: XOR<CollectionCreateWithoutCampaignsInput, CollectionUncheckedCreateWithoutCampaignsInput>
    where?: CollectionWhereInput
  }

  export type CollectionUpdateToOneWithWhereWithoutCampaignsInput = {
    where?: CollectionWhereInput
    data: XOR<CollectionUpdateWithoutCampaignsInput, CollectionUncheckedUpdateWithoutCampaignsInput>
  }

  export type CollectionUpdateWithoutCampaignsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCollectionsNestedInput
  }

  export type CollectionUncheckedUpdateWithoutCampaignsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type CampaignCreateWithoutFavoritesInput = {
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateCreateNestedManyWithoutCampaignInput
    comments?: CommentCreateNestedManyWithoutCampaignInput
    payments?: PaymentCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionCreateNestedManyWithoutCampaignInput
  }

  export type CampaignUncheckedCreateWithoutFavoritesInput = {
    id?: number
    title: string
    description: string
    fundingGoal: string
    startTime: Date | string
    endTime: Date | string
    creatorAddress: string
    status?: $Enums.CampaignStatus
    transactionHash?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignAddress?: string | null
    slug: string
    location?: string | null
    treasuryAddress?: string | null
    category?: string | null
    images?: CampaignImageUncheckedCreateNestedManyWithoutCampaignInput
    updates?: CampaignUpdateUncheckedCreateNestedManyWithoutCampaignInput
    comments?: CommentUncheckedCreateNestedManyWithoutCampaignInput
    payments?: PaymentUncheckedCreateNestedManyWithoutCampaignInput
    RoundCampaigns?: RoundCampaignsUncheckedCreateNestedManyWithoutCampaignInput
    collections?: CampaignCollectionUncheckedCreateNestedManyWithoutCampaignInput
  }

  export type CampaignCreateOrConnectWithoutFavoritesInput = {
    where: CampaignWhereUniqueInput
    create: XOR<CampaignCreateWithoutFavoritesInput, CampaignUncheckedCreateWithoutFavoritesInput>
  }

  export type CampaignUpsertWithoutFavoritesInput = {
    update: XOR<CampaignUpdateWithoutFavoritesInput, CampaignUncheckedUpdateWithoutFavoritesInput>
    create: XOR<CampaignCreateWithoutFavoritesInput, CampaignUncheckedCreateWithoutFavoritesInput>
    where?: CampaignWhereInput
  }

  export type CampaignUpdateToOneWithWhereWithoutFavoritesInput = {
    where?: CampaignWhereInput
    data: XOR<CampaignUpdateWithoutFavoritesInput, CampaignUncheckedUpdateWithoutFavoritesInput>
  }

  export type CampaignUpdateWithoutFavoritesInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUpdateManyWithoutCampaignNestedInput
    comments?: CommentUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignUncheckedUpdateWithoutFavoritesInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    fundingGoal?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignAddress?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    treasuryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    images?: CampaignImageUncheckedUpdateManyWithoutCampaignNestedInput
    updates?: CampaignUpdateUncheckedUpdateManyWithoutCampaignNestedInput
    comments?: CommentUncheckedUpdateManyWithoutCampaignNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutCampaignNestedInput
    RoundCampaigns?: RoundCampaignsUncheckedUpdateManyWithoutCampaignNestedInput
    collections?: CampaignCollectionUncheckedUpdateManyWithoutCampaignNestedInput
  }

  export type CampaignImageCreateManyCampaignInput = {
    id?: number
    imageUrl: string
    isMainImage?: boolean
  }

  export type CampaignUpdateCreateManyCampaignInput = {
    id?: number
    title: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    creatorAddress: string
  }

  export type CommentCreateManyCampaignInput = {
    id?: number
    content: string
    userAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentCreateManyCampaignInput = {
    id?: number
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
  }

  export type RoundCampaignsCreateManyCampaignInput = {
    id?: number
    roundId: number
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
  }

  export type CampaignCollectionCreateManyCampaignInput = {
    collectionId: string
    assignedAt?: Date | string
  }

  export type FavoriteCreateManyCampaignInput = {
    id?: number
    userAddress: string
    createdAt?: Date | string
  }

  export type CampaignImageUpdateWithoutCampaignInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    isMainImage?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CampaignImageUncheckedUpdateWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    imageUrl?: StringFieldUpdateOperationsInput | string
    isMainImage?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CampaignImageUncheckedUpdateManyWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    imageUrl?: StringFieldUpdateOperationsInput | string
    isMainImage?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CampaignUpdateUpdateWithoutCampaignInput = {
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
  }

  export type CampaignUpdateUncheckedUpdateWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
  }

  export type CampaignUpdateUncheckedUpdateManyWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creatorAddress?: StringFieldUpdateOperationsInput | string
  }

  export type CommentUpdateWithoutCampaignInput = {
    content?: StringFieldUpdateOperationsInput | string
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateManyWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUpdateWithoutCampaignInput = {
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPaymentsNestedInput
  }

  export type PaymentUncheckedUpdateWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type PaymentUncheckedUpdateManyWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type RoundCampaignsUpdateWithoutCampaignInput = {
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Round?: RoundUpdateOneRequiredWithoutRoundCampaignsNestedInput
  }

  export type RoundCampaignsUncheckedUpdateWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    roundId?: IntFieldUpdateOperationsInput | number
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RoundCampaignsUncheckedUpdateManyWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    roundId?: IntFieldUpdateOperationsInput | number
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CampaignCollectionUpdateWithoutCampaignInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection?: CollectionUpdateOneRequiredWithoutCampaignsNestedInput
  }

  export type CampaignCollectionUncheckedUpdateWithoutCampaignInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CampaignCollectionUncheckedUpdateManyWithoutCampaignInput = {
    collectionId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FavoriteUpdateWithoutCampaignInput = {
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FavoriteUncheckedUpdateWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FavoriteUncheckedUpdateManyWithoutCampaignInput = {
    id?: IntFieldUpdateOperationsInput | number
    userAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateManyUserInput = {
    id?: number
    amount: string
    token: string
    status?: string
    transactionHash?: string | null
    isAnonymous?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    campaignId: number
  }

  export type CollectionCreateManyUserInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUpdateWithoutUserInput = {
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaign?: CampaignUpdateOneRequiredWithoutPaymentsNestedInput
  }

  export type PaymentUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
  }

  export type PaymentUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaignId?: IntFieldUpdateOperationsInput | number
  }

  export type CollectionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaigns?: CampaignCollectionUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaigns?: CampaignCollectionUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type CollectionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoundCampaignsCreateManyRoundInput = {
    id?: number
    campaignId: number
    status?: $Enums.RecipientStatus
    recipientAddress?: string | null
    submittedByWalletAddress?: string | null
    txHash?: string | null
    onchainRecipientId?: string | null
    reviewedAt?: Date | string | null
  }

  export type RoundCampaignsUpdateWithoutRoundInput = {
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Campaign?: CampaignUpdateOneRequiredWithoutRoundCampaignsNestedInput
  }

  export type RoundCampaignsUncheckedUpdateWithoutRoundInput = {
    id?: IntFieldUpdateOperationsInput | number
    campaignId?: IntFieldUpdateOperationsInput | number
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RoundCampaignsUncheckedUpdateManyWithoutRoundInput = {
    id?: IntFieldUpdateOperationsInput | number
    campaignId?: IntFieldUpdateOperationsInput | number
    status?: EnumRecipientStatusFieldUpdateOperationsInput | $Enums.RecipientStatus
    recipientAddress?: NullableStringFieldUpdateOperationsInput | string | null
    submittedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    onchainRecipientId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CampaignCollectionCreateManyCollectionInput = {
    campaignId: number
    assignedAt?: Date | string
  }

  export type CampaignCollectionUpdateWithoutCollectionInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    campaign?: CampaignUpdateOneRequiredWithoutCollectionsNestedInput
  }

  export type CampaignCollectionUncheckedUpdateWithoutCollectionInput = {
    campaignId?: IntFieldUpdateOperationsInput | number
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CampaignCollectionUncheckedUpdateManyWithoutCollectionInput = {
    campaignId?: IntFieldUpdateOperationsInput | number
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}