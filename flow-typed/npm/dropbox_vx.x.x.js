// // @flow

// /* eslint-disable camelcase */

// // flowgen from https://github.com/dropbox/dropbox-sdk-js/blob/master/generator/typescript

// declare module 'dropbox' {
//   declare var DropboxTypes: typeof npm$namespace$DropboxTypes;

//   declare var npm$namespace$DropboxTypes: {|
//     DropboxBase: typeof DropboxTypes$DropboxBase
//   |};
//   declare interface DropboxTypes$DropboxOptions {
//     accessToken?: string;
//     clientId?: string;
//     selectUser?: string;
//     pathRoot?: string;
//     fetch?: Function;
//   }

//   declare class DropboxTypes$DropboxBase {
//     /**
//     * Get the access token.
//     */
//     getAccessToken(): string;

//     /**
//   * Get an OAuth2 access token from an OAuth2 Code.
//   * @param redirectUri A URL to redirect the user to after authenticating.
//   This must be added to your app through the admin interface.
//   * @param code An OAuth2 code.
//   */
//     getAccessTokenFromCode(redirectUri: string, code: string): Promise<string>;

//     /**
//     * An authentication process that works with cordova applications.
//     * @param successCallback Called when the authentication succeed
//     * @param errorCallback Called when the authentication failed.
//     */
//     authenticateWithCordova(
//       successCallback: (accessToken: string) => void,
//       errorCallback: () => void
//     ): void;

//     /**
//   * Get a URL that can be used to authenticate users for the Dropbox API.
//   * @param redirectUri A URL to redirect the user to after authenticating.
//   This must be added to your app through the admin interface.
//   * @param state State that will be returned in the redirect URL to help
//   prevent cross site scripting attacks.
//   */
//     getAuthenticationUrl(
//       redirectUri: string,
//       state?: string,
//       authType?: "token" | "code"
//     ): string;

//     /**
//     * Get the client id
//     */
//     getClientId(): string;

//     /**
//     * Set the access token used to authenticate requests to the API.
//     * @param accessToken An access token.
//     */
//     setAccessToken(accessToken: string): void;

//     /**
//     * Set the client id, which is used to help gain an access token.
//     * @param clientId Your app's client ID.
//     */
//     setClientId(clientId: string): void;

//     /**
//     * Set the client secret
//     * @param clientSecret Your app's client secret.
//     */
//     setClientSecret(clientSecret: string): void;
//   }

//   /**
//   * An Error object returned from a route.
//   */
//   declare interface DropboxTypes$Error<T> {
//     error_summary: string;
//     error: T;
//     user_message: DropboxTypes$UserMessage;
//   }

//   /**
//   * User-friendly error message.
//   */
//   declare interface DropboxTypes$UserMessage {
//     text: string;
//     locale: string;
//   }

//   declare type DropboxTypes$Timestamp = string;

//   /**
//   * The job finished synchronously and successfully.
//   */
//   declare interface DropboxTypes$async$LaunchEmptyResultComplete {
//     ".tag": "complete";
//   }

//   /**
//   * Result returned by methods that may either launch an asynchronous job or
//   * complete synchronously. Upon synchronous completion of the job, no
//   * additional information is returned.
//   */
//   declare type DropboxTypes$async$LaunchEmptyResult =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$async$LaunchEmptyResultComplete;

//   /**
//   * This response indicates that the processing is asynchronous. The string
//   * is an id that can be used to obtain the status of the asynchronous job.
//   */
//   declare interface DropboxTypes$async$LaunchResultBaseAsyncJobId {
//     ".tag": "async_job_id";
//     async_job_id: DropboxTypes$async$AsyncJobId;
//   }

//   /**
//   * Result returned by methods that launch an asynchronous job. A method who
//   * may either launch an asynchronous job, or complete the request
//   * synchronously, can use this union by extending it, and adding a
//   * 'complete' field with the type of the synchronous response. See
//   * async.LaunchEmptyResult for an example.
//   */
//   declare type DropboxTypes$async$LaunchResultBase = DropboxTypes$async$LaunchResultBaseAsyncJobId;

//   /**
//   * Arguments for methods that poll the status of an asynchronous job.
//   */
//   declare interface DropboxTypes$async$PollArg {
//     /**
//     * Id of the asynchronous job. This is the value of a response returned
//     * from the method that launched the job.
//     */
//     async_job_id: DropboxTypes$async$AsyncJobId;
//   }

//   /**
//   * The asynchronous job has completed successfully.
//   */
//   declare interface DropboxTypes$async$PollEmptyResultComplete {
//     ".tag": "complete";
//   }

//   /**
//   * Result returned by methods that poll for the status of an asynchronous
//   * job. Upon completion of the job, no additional information is returned.
//   */
//   declare type DropboxTypes$async$PollEmptyResult =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$async$PollEmptyResultComplete;

//   /**
//   * The job ID is invalid.
//   */
//   declare interface DropboxTypes$async$PollErrorInvalidAsyncJobId {
//     ".tag": "invalid_async_job_id";
//   }

//   /**
//   * Something went wrong with the job on Dropbox's end. You'll need to verify
//   * that the action you were taking succeeded, and if not, try again. This
//   * should happen very rarely.
//   */
//   declare interface DropboxTypes$async$PollErrorInternalError {
//     ".tag": "internal_error";
//   }

//   declare interface DropboxTypes$async$PollErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned by methods for polling the status of asynchronous job.
//   */
//   declare type DropboxTypes$async$PollError =
//     | DropboxTypes$async$PollErrorInvalidAsyncJobId
//     | DropboxTypes$async$PollErrorInternalError
//     | DropboxTypes$async$PollErrorOther;

//   /**
//   * The asynchronous job is still in progress.
//   */
//   declare interface DropboxTypes$async$PollResultBaseInProgress {
//     ".tag": "in_progress";
//   }

//   /**
//   * Result returned by methods that poll for the status of an asynchronous
//   * job. Unions that extend this union should add a 'complete' field with a
//   * type of the information returned upon job completion. See
//   * async.PollEmptyResult for an example.
//   */
//   declare type DropboxTypes$async$PollResultBase = DropboxTypes$async$PollResultBaseInProgress;

//   declare type DropboxTypes$async$AsyncJobId = string;

//   /**
//   * Current account type cannot access the resource.
//   */
//   declare interface DropboxTypes$auth$AccessErrorInvalidAccountType {
//     ".tag": "invalid_account_type";
//     invalid_account_type: DropboxTypes$auth$InvalidAccountTypeError;
//   }

//   /**
//   * Current account cannot access Paper.
//   */
//   declare interface DropboxTypes$auth$AccessErrorPaperAccessDenied {
//     ".tag": "paper_access_denied";
//     paper_access_denied: DropboxTypes$auth$PaperAccessError;
//   }

//   declare interface DropboxTypes$auth$AccessErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error occurred because the account doesn't have permission to access the
//   * resource.
//   */
//   declare type DropboxTypes$auth$AccessError =
//     | DropboxTypes$auth$AccessErrorInvalidAccountType
//     | DropboxTypes$auth$AccessErrorPaperAccessDenied
//     | DropboxTypes$auth$AccessErrorOther;

//   /**
//   * The access token is invalid.
//   */
//   declare interface DropboxTypes$auth$AuthErrorInvalidAccessToken {
//     ".tag": "invalid_access_token";
//   }

//   /**
//   * The user specified in 'Dropbox-API-Select-User' is no longer on the team.
//   */
//   declare interface DropboxTypes$auth$AuthErrorInvalidSelectUser {
//     ".tag": "invalid_select_user";
//   }

//   /**
//   * The user specified in 'Dropbox-API-Select-Admin' is not a Dropbox
//   * Business team admin.
//   */
//   declare interface DropboxTypes$auth$AuthErrorInvalidSelectAdmin {
//     ".tag": "invalid_select_admin";
//   }

//   /**
//   * The user has been suspended.
//   */
//   declare interface DropboxTypes$auth$AuthErrorUserSuspended {
//     ".tag": "user_suspended";
//   }

//   /**
//   * The access token has expired.
//   */
//   declare interface DropboxTypes$auth$AuthErrorExpiredAccessToken {
//     ".tag": "expired_access_token";
//   }

//   /**
//   * The access token does not have the required scope to access the route.
//   */
//   declare type DropboxTypes$auth$AuthErrorMissingScope = {
//     ".tag": "missing_scope",
//     ...
//   } & DropboxTypes$auth$TokenScopeError;

//   declare interface DropboxTypes$auth$AuthErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Errors occurred during authentication.
//   */
//   declare type DropboxTypes$auth$AuthError =
//     | DropboxTypes$auth$AuthErrorInvalidAccessToken
//     | DropboxTypes$auth$AuthErrorInvalidSelectUser
//     | DropboxTypes$auth$AuthErrorInvalidSelectAdmin
//     | DropboxTypes$auth$AuthErrorUserSuspended
//     | DropboxTypes$auth$AuthErrorExpiredAccessToken
//     | DropboxTypes$auth$AuthErrorMissingScope
//     | DropboxTypes$auth$AuthErrorOther;

//   /**
//   * Current account type doesn't have permission to access this route
//   * endpoint.
//   */
//   declare interface DropboxTypes$auth$InvalidAccountTypeErrorEndpoint {
//     ".tag": "endpoint";
//   }

//   /**
//   * Current account type doesn't have permission to access this feature.
//   */
//   declare interface DropboxTypes$auth$InvalidAccountTypeErrorFeature {
//     ".tag": "feature";
//   }

//   declare interface DropboxTypes$auth$InvalidAccountTypeErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$auth$InvalidAccountTypeError =
//     | DropboxTypes$auth$InvalidAccountTypeErrorEndpoint
//     | DropboxTypes$auth$InvalidAccountTypeErrorFeature
//     | DropboxTypes$auth$InvalidAccountTypeErrorOther;

//   /**
//   * Paper is disabled.
//   */
//   declare interface DropboxTypes$auth$PaperAccessErrorPaperDisabled {
//     ".tag": "paper_disabled";
//   }

//   /**
//   * The provided user has not used Paper yet.
//   */
//   declare interface DropboxTypes$auth$PaperAccessErrorNotPaperUser {
//     ".tag": "not_paper_user";
//   }

//   declare interface DropboxTypes$auth$PaperAccessErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$auth$PaperAccessError =
//     | DropboxTypes$auth$PaperAccessErrorPaperDisabled
//     | DropboxTypes$auth$PaperAccessErrorNotPaperUser
//     | DropboxTypes$auth$PaperAccessErrorOther;

//   /**
//   * Error occurred because the app is being rate limited.
//   */
//   declare interface DropboxTypes$auth$RateLimitError {
//     /**
//     * The reason why the app is being rate limited.
//     */
//     reason: DropboxTypes$auth$RateLimitReason;

//     /**
//     * Defaults to 1.
//     */
//     retry_after?: number;
//   }

//   /**
//   * You are making too many requests in the past few minutes.
//   */
//   declare interface DropboxTypes$auth$RateLimitReasonTooManyRequests {
//     ".tag": "too_many_requests";
//   }

//   /**
//   * There are currently too many write operations happening in the user's
//   * Dropbox.
//   */
//   declare interface DropboxTypes$auth$RateLimitReasonTooManyWriteOperations {
//     ".tag": "too_many_write_operations";
//   }

//   declare interface DropboxTypes$auth$RateLimitReasonOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$auth$RateLimitReason =
//     | DropboxTypes$auth$RateLimitReasonTooManyRequests
//     | DropboxTypes$auth$RateLimitReasonTooManyWriteOperations
//     | DropboxTypes$auth$RateLimitReasonOther;

//   declare interface DropboxTypes$auth$TokenFromOAuth1Arg {
//     /**
//     * The supplied OAuth 1.0 access token.
//     */
//     oauth1_token: string;

//     /**
//     * The token secret associated with the supplied access token.
//     */
//     oauth1_token_secret: string;
//   }

//   /**
//   * Part or all of the OAuth 1.0 access token info is invalid.
//   */
//   declare interface DropboxTypes$auth$TokenFromOAuth1ErrorInvalidOauth1TokenInfo {
//     ".tag": "invalid_oauth1_token_info";
//   }

//   /**
//   * The authorized app does not match the app associated with the supplied
//   * access token.
//   */
//   declare interface DropboxTypes$auth$TokenFromOAuth1ErrorAppIdMismatch {
//     ".tag": "app_id_mismatch";
//   }

//   declare interface DropboxTypes$auth$TokenFromOAuth1ErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$auth$TokenFromOAuth1Error =
//     | DropboxTypes$auth$TokenFromOAuth1ErrorInvalidOauth1TokenInfo
//     | DropboxTypes$auth$TokenFromOAuth1ErrorAppIdMismatch
//     | DropboxTypes$auth$TokenFromOAuth1ErrorOther;

//   declare interface DropboxTypes$auth$TokenFromOAuth1Result {
//     /**
//     * The OAuth 2.0 token generated from the supplied OAuth 1.0 token.
//     */
//     oauth2_token: string;
//   }

//   declare interface DropboxTypes$auth$TokenScopeError {
//     /**
//     * The required scope to access the route.
//     */
//     required_scope: string;
//   }

//   /**
//   * Paths are relative to the authenticating user's home namespace, whether
//   * or not that user belongs to a team.
//   */
//   declare interface DropboxTypes$common$PathRootHome {
//     ".tag": "home";
//   }

//   /**
//   * Paths are relative to the authenticating user's root namespace (This
//   * results in PathRootError.invalid_root if the user's root namespace has
//   * changed.).
//   */
//   declare interface DropboxTypes$common$PathRootRoot {
//     ".tag": "root";
//     root: DropboxTypes$common$NamespaceId;
//   }

//   /**
//   * Paths are relative to given namespace id (This results in
//   * PathRootError.no_permission if you don't have access to this namespace.).
//   */
//   declare interface DropboxTypes$common$PathRootNamespaceId {
//     ".tag": "namespace_id";
//     namespace_id: DropboxTypes$common$NamespaceId;
//   }

//   declare interface DropboxTypes$common$PathRootOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$common$PathRoot =
//     | DropboxTypes$common$PathRootHome
//     | DropboxTypes$common$PathRootRoot
//     | DropboxTypes$common$PathRootNamespaceId
//     | DropboxTypes$common$PathRootOther;

//   /**
//   * The root namespace id in Dropbox-API-Path-Root header is not valid. The
//   * value of this error is use's latest root info.
//   */
//   declare interface DropboxTypes$common$PathRootErrorInvalidRoot {
//     ".tag": "invalid_root";
//     invalid_root:
//       | DropboxTypes$common$TeamRootInfoReference
//       | DropboxTypes$common$UserRootInfoReference
//       | DropboxTypes$common$RootInfoReference;
//   }

//   /**
//   * You don't have permission to access the namespace id in
//   * Dropbox-API-Path-Root  header.
//   */
//   declare interface DropboxTypes$common$PathRootErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   declare interface DropboxTypes$common$PathRootErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$common$PathRootError =
//     | DropboxTypes$common$PathRootErrorInvalidRoot
//     | DropboxTypes$common$PathRootErrorNoPermission
//     | DropboxTypes$common$PathRootErrorOther;

//   /**
//   * Information about current user's root.
//   */
//   declare interface DropboxTypes$common$RootInfo {
//     /**
//     * The namespace ID for user's root namespace. It will be the namespace ID
//     * of the shared team root if the user is member of a team with a separate
//     * team root. Otherwise it will be same as RootInfo.home_namespace_id.
//     */
//     root_namespace_id: DropboxTypes$common$NamespaceId;

//     /**
//     * The namespace ID for user's home namespace.
//     */
//     home_namespace_id: DropboxTypes$common$NamespaceId;
//   }

//   /**
//   * Reference to the RootInfo polymorphic type. Contains a .tag property to
//   * let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$common$RootInfoReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "team" | "user",
//     ...
//   } & DropboxTypes$common$RootInfo;

//   /**
//   * Root info when user is member of a team with a separate root namespace
//   * ID.
//   */
//   declare type DropboxTypes$common$TeamRootInfo = {
//     /**
//     * The path for user's home directory under the shared team root.
//     */
//     home_path: string,
//     ...
//   } & DropboxTypes$common$RootInfo;

//   /**
//   * Reference to the TeamRootInfo type, identified by the value of the .tag
//   * property.
//   */
//   declare type DropboxTypes$common$TeamRootInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "team",
//     ...
//   } & DropboxTypes$common$TeamRootInfo;

//   /**
//   * Root info when user is not member of a team or the user is a member of a
//   * team and the team does not have a separate root namespace.
//   */
//   declare type DropboxTypes$common$UserRootInfo = {
//     ...
//   } & DropboxTypes$common$RootInfo;

//   /**
//   * Reference to the UserRootInfo type, identified by the value of the .tag
//   * property.
//   */
//   declare type DropboxTypes$common$UserRootInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "user",
//     ...
//   } & DropboxTypes$common$UserRootInfo;

//   declare type DropboxTypes$common$Date = DropboxTypes$Timestamp;

//   declare type DropboxTypes$common$DisplayName = string;

//   declare type DropboxTypes$common$DisplayNameLegacy = string;

//   declare type DropboxTypes$common$DropboxTimestamp = DropboxTypes$Timestamp;

//   declare type DropboxTypes$common$EmailAddress = string;

//   declare type DropboxTypes$common$LanguageCode = string;

//   declare type DropboxTypes$common$NamePart = string;

//   declare type DropboxTypes$common$NamespaceId = string;

//   declare type DropboxTypes$common$OptionalNamePart = string;

//   declare type DropboxTypes$common$SessionId = string;

//   declare type DropboxTypes$common$SharedFolderId = DropboxTypes$common$NamespaceId;

//   declare interface DropboxTypes$contacts$DeleteManualContactsArg {
//     /**
//     * List of manually added contacts to be deleted.
//     */
//     email_addresses: Array<DropboxTypes$common$EmailAddress>;
//   }

//   /**
//   * Can't delete contacts from this list. Make sure the list only has
//   * manually added contacts. The deletion was cancelled.
//   */
//   declare interface DropboxTypes$contacts$DeleteManualContactsErrorContactsNotFound {
//     ".tag": "contacts_not_found";
//     contacts_not_found: Array<DropboxTypes$common$EmailAddress>;
//   }

//   declare interface DropboxTypes$contacts$DeleteManualContactsErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$contacts$DeleteManualContactsError =
//     | DropboxTypes$contacts$DeleteManualContactsErrorContactsNotFound
//     | DropboxTypes$contacts$DeleteManualContactsErrorOther;

//   declare interface DropboxTypes$file_properties$AddPropertiesArg {
//     /**
//     * A unique identifier for the file or folder.
//     */
//     path: DropboxTypes$file_properties$PathOrId;

//     /**
//     * The property groups which are to be added to a Dropbox file.
//     */
//     property_groups: Array<DropboxTypes$file_properties$PropertyGroup>;
//   }

//   /**
//   * A property group associated with this template and file already exists.
//   */
//   declare interface DropboxTypes$file_properties$AddPropertiesErrorPropertyGroupAlreadyExists {
//     ".tag": "property_group_already_exists";
//   }

//   declare type DropboxTypes$file_properties$AddPropertiesError =
//     | DropboxTypes$file_properties$InvalidPropertyGroupError
//     | DropboxTypes$file_properties$AddPropertiesErrorPropertyGroupAlreadyExists;

//   declare type DropboxTypes$file_properties$AddTemplateArg = {
//     ...
//   } & DropboxTypes$file_properties$PropertyGroupTemplate;

//   declare interface DropboxTypes$file_properties$AddTemplateResult {
//     /**
//     * An identifier for template added by  See templatesAddForUser() or
//     * templatesAddForTeam().
//     */
//     template_id: DropboxTypes$file_properties$TemplateId;
//   }

//   declare interface DropboxTypes$file_properties$GetTemplateArg {
//     /**
//     * An identifier for template added by route  See templatesAddForUser() or
//     * templatesAddForTeam().
//     */
//     template_id: DropboxTypes$file_properties$TemplateId;
//   }

//   declare type DropboxTypes$file_properties$GetTemplateResult = {
//     ...
//   } & DropboxTypes$file_properties$PropertyGroupTemplate;

//   /**
//   * One or more of the supplied property field values is too large.
//   */
//   declare interface DropboxTypes$file_properties$InvalidPropertyGroupErrorPropertyFieldTooLarge {
//     ".tag": "property_field_too_large";
//   }

//   /**
//   * One or more of the supplied property fields does not conform to the
//   * template specifications.
//   */
//   declare interface DropboxTypes$file_properties$InvalidPropertyGroupErrorDoesNotFitTemplate {
//     ".tag": "does_not_fit_template";
//   }

//   declare type DropboxTypes$file_properties$InvalidPropertyGroupError =
//     | DropboxTypes$file_properties$PropertiesError
//     | DropboxTypes$file_properties$InvalidPropertyGroupErrorPropertyFieldTooLarge
//     | DropboxTypes$file_properties$InvalidPropertyGroupErrorDoesNotFitTemplate;

//   declare interface DropboxTypes$file_properties$ListTemplateResult {
//     /**
//     * List of identifiers for templates added by  See templatesAddForUser()
//     * or templatesAddForTeam().
//     */
//     template_ids: Array<DropboxTypes$file_properties$TemplateId>;
//   }

//   /**
//   * Append a query with an "or" operator.
//   */
//   declare interface DropboxTypes$file_properties$LogicalOperatorOrOperator {
//     ".tag": "or_operator";
//   }

//   declare interface DropboxTypes$file_properties$LogicalOperatorOther {
//     ".tag": "other";
//   }

//   /**
//   * Logical operator to join search queries together.
//   */
//   declare type DropboxTypes$file_properties$LogicalOperator =
//     | DropboxTypes$file_properties$LogicalOperatorOrOperator
//     | DropboxTypes$file_properties$LogicalOperatorOther;

//   /**
//   * No property group was found.
//   */
//   declare interface DropboxTypes$file_properties$LookUpPropertiesErrorPropertyGroupNotFound {
//     ".tag": "property_group_not_found";
//   }

//   declare interface DropboxTypes$file_properties$LookUpPropertiesErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$LookUpPropertiesError =
//     | DropboxTypes$file_properties$LookUpPropertiesErrorPropertyGroupNotFound
//     | DropboxTypes$file_properties$LookUpPropertiesErrorOther;

//   declare interface DropboxTypes$file_properties$LookupErrorMalformedPath {
//     ".tag": "malformed_path";
//     malformed_path: string;
//   }

//   /**
//   * There is nothing at the given path.
//   */
//   declare interface DropboxTypes$file_properties$LookupErrorNotFound {
//     ".tag": "not_found";
//   }

//   /**
//   * We were expecting a file, but the given path refers to something that
//   * isn't a file.
//   */
//   declare interface DropboxTypes$file_properties$LookupErrorNotFile {
//     ".tag": "not_file";
//   }

//   /**
//   * We were expecting a folder, but the given path refers to something that
//   * isn't a folder.
//   */
//   declare interface DropboxTypes$file_properties$LookupErrorNotFolder {
//     ".tag": "not_folder";
//   }

//   /**
//   * The file cannot be transferred because the content is restricted.  For
//   * example, sometimes there are legal restrictions due to copyright claims.
//   */
//   declare interface DropboxTypes$file_properties$LookupErrorRestrictedContent {
//     ".tag": "restricted_content";
//   }

//   declare interface DropboxTypes$file_properties$LookupErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$LookupError =
//     | DropboxTypes$file_properties$LookupErrorMalformedPath
//     | DropboxTypes$file_properties$LookupErrorNotFound
//     | DropboxTypes$file_properties$LookupErrorNotFile
//     | DropboxTypes$file_properties$LookupErrorNotFolder
//     | DropboxTypes$file_properties$LookupErrorRestrictedContent
//     | DropboxTypes$file_properties$LookupErrorOther;

//   /**
//   * A property field key with that name already exists in the template.
//   */
//   declare interface DropboxTypes$file_properties$ModifyTemplateErrorConflictingPropertyNames {
//     ".tag": "conflicting_property_names";
//   }

//   /**
//   * There are too many properties in the changed template. The maximum number
//   * of properties per template is 32.
//   */
//   declare interface DropboxTypes$file_properties$ModifyTemplateErrorTooManyProperties {
//     ".tag": "too_many_properties";
//   }

//   /**
//   * There are too many templates for the team.
//   */
//   declare interface DropboxTypes$file_properties$ModifyTemplateErrorTooManyTemplates {
//     ".tag": "too_many_templates";
//   }

//   /**
//   * The template name, description or one or more of the property field keys
//   * is too large.
//   */
//   declare interface DropboxTypes$file_properties$ModifyTemplateErrorTemplateAttributeTooLarge {
//     ".tag": "template_attribute_too_large";
//   }

//   declare type DropboxTypes$file_properties$ModifyTemplateError =
//     | DropboxTypes$file_properties$TemplateError
//     | DropboxTypes$file_properties$ModifyTemplateErrorConflictingPropertyNames
//     | DropboxTypes$file_properties$ModifyTemplateErrorTooManyProperties
//     | DropboxTypes$file_properties$ModifyTemplateErrorTooManyTemplates
//     | DropboxTypes$file_properties$ModifyTemplateErrorTemplateAttributeTooLarge;

//   declare interface DropboxTypes$file_properties$OverwritePropertyGroupArg {
//     /**
//     * A unique identifier for the file or folder.
//     */
//     path: DropboxTypes$file_properties$PathOrId;

//     /**
//     * The property groups "snapshot" updates to force apply.
//     */
//     property_groups: Array<DropboxTypes$file_properties$PropertyGroup>;
//   }

//   declare interface DropboxTypes$file_properties$PropertiesErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$file_properties$LookupError;
//   }

//   /**
//   * This folder cannot be tagged. Tagging folders is not supported for
//   * team-owned templates.
//   */
//   declare interface DropboxTypes$file_properties$PropertiesErrorUnsupportedFolder {
//     ".tag": "unsupported_folder";
//   }

//   declare type DropboxTypes$file_properties$PropertiesError =
//     | DropboxTypes$file_properties$TemplateError
//     | DropboxTypes$file_properties$PropertiesErrorPath
//     | DropboxTypes$file_properties$PropertiesErrorUnsupportedFolder;

//   declare interface DropboxTypes$file_properties$PropertiesSearchArg {
//     /**
//     * Queries to search.
//     */
//     queries: Array<DropboxTypes$file_properties$PropertiesSearchQuery>;

//     /**
//     * Defaults to TagRef(Union(u'TemplateFilter', [UnionField(u'filter_none',
//     * Void, False, None)]), u'filter_none').
//     */
//     template_filter?: DropboxTypes$file_properties$TemplateFilter;
//   }

//   declare interface DropboxTypes$file_properties$PropertiesSearchContinueArg {
//     /**
//     * The cursor returned by your last call to propertiesSearch() or
//     * propertiesSearchContinue().
//     */
//     cursor: DropboxTypes$file_properties$PropertiesSearchCursor;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call propertiesSearch()
//   * to obtain a new cursor.
//   */
//   declare interface DropboxTypes$file_properties$PropertiesSearchContinueErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$file_properties$PropertiesSearchContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$PropertiesSearchContinueError =
//     | DropboxTypes$file_properties$PropertiesSearchContinueErrorReset
//     | DropboxTypes$file_properties$PropertiesSearchContinueErrorOther;

//   declare interface DropboxTypes$file_properties$PropertiesSearchErrorPropertyGroupLookup {
//     ".tag": "property_group_lookup";
//     property_group_lookup: DropboxTypes$file_properties$LookUpPropertiesError;
//   }

//   declare interface DropboxTypes$file_properties$PropertiesSearchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$PropertiesSearchError =
//     | DropboxTypes$file_properties$PropertiesSearchErrorPropertyGroupLookup
//     | DropboxTypes$file_properties$PropertiesSearchErrorOther;

//   declare interface DropboxTypes$file_properties$PropertiesSearchMatch {
//     /**
//     * The ID for the matched file or folder.
//     */
//     id: DropboxTypes$file_properties$Id;

//     /**
//     * The path for the matched file or folder.
//     */
//     path: string;

//     /**
//     * Whether the file or folder is deleted.
//     */
//     is_deleted: boolean;

//     /**
//     * List of custom property groups associated with the file.
//     */
//     property_groups: Array<DropboxTypes$file_properties$PropertyGroup>;
//   }

//   /**
//   * Search for a value associated with this field name.
//   */
//   declare interface DropboxTypes$file_properties$PropertiesSearchModeFieldName {
//     ".tag": "field_name";
//     field_name: string;
//   }

//   declare interface DropboxTypes$file_properties$PropertiesSearchModeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$PropertiesSearchMode =
//     | DropboxTypes$file_properties$PropertiesSearchModeFieldName
//     | DropboxTypes$file_properties$PropertiesSearchModeOther;

//   declare interface DropboxTypes$file_properties$PropertiesSearchQuery {
//     /**
//     * The property field value for which to search across templates.
//     */
//     query: string;

//     /**
//     * The mode with which to perform the search.
//     */
//     mode: DropboxTypes$file_properties$PropertiesSearchMode;

//     /**
//     * Defaults to TagRef(Union(u'LogicalOperator',
//     * [UnionField(u'or_operator', Void, False, None), UnionField(u'other',
//     * Void, True, None)]), u'or_operator').
//     */
//     logical_operator?: DropboxTypes$file_properties$LogicalOperator;
//   }

//   declare interface DropboxTypes$file_properties$PropertiesSearchResult {
//     /**
//     * A list (possibly empty) of matches for the query.
//     */
//     matches: Array<DropboxTypes$file_properties$PropertiesSearchMatch>;

//     /**
//     * Pass the cursor into propertiesSearchContinue() to continue to receive
//     * search results. Cursor will be null when there are no more results.
//     */
//     cursor?: DropboxTypes$file_properties$PropertiesSearchCursor;
//   }

//   /**
//   * Raw key/value data to be associated with a Dropbox file. Property fields
//   * are added to Dropbox files as a file_properties.PropertyGroup.
//   */
//   declare interface DropboxTypes$file_properties$PropertyField {
//     /**
//     * Key of the property field associated with a file and template. Keys can
//     * be up to 256 bytes.
//     */
//     name: string;

//     /**
//     * Value of the property field associated with a file and template. Values
//     * can be up to 1024 bytes.
//     */
//     value: string;
//   }

//   /**
//   * Defines how a single property field may be structured. Used exclusively
//   * by file_properties.PropertyGroupTemplate.
//   */
//   declare interface DropboxTypes$file_properties$PropertyFieldTemplate {
//     /**
//     * Key of the property field being described. Property field keys can be
//     * up to 256 bytes.
//     */
//     name: string;

//     /**
//     * Description of the property field. Property field descriptions can be
//     * up to 1024 bytes.
//     */
//     description: string;

//     /**
//     * Data type of the value of this property field. This type will be
//     * enforced upon property creation and modifications.
//     */
//     type: DropboxTypes$file_properties$PropertyType;
//   }

//   /**
//   * A subset of the property fields described by the corresponding
//   * file_properties.PropertyGroupTemplate. Properties are always added to a
//   * Dropbox file as a file_properties.PropertyGroup. The possible key names
//   * and value types in this group are defined by the corresponding
//   * file_properties.PropertyGroupTemplate.
//   */
//   declare interface DropboxTypes$file_properties$PropertyGroup {
//     /**
//     * A unique identifier for the associated template.
//     */
//     template_id: DropboxTypes$file_properties$TemplateId;

//     /**
//     * The actual properties associated with the template. There can be up to
//     * 32 property types per template.
//     */
//     fields: Array<DropboxTypes$file_properties$PropertyField>;
//   }

//   /**
//   * Defines how a property group may be structured.
//   */
//   declare interface DropboxTypes$file_properties$PropertyGroupTemplate {
//     /**
//     * Display name for the template. Template names can be up to 256 bytes.
//     */
//     name: string;

//     /**
//     * Description for the template. Template descriptions can be up to 1024
//     * bytes.
//     */
//     description: string;

//     /**
//     * Definitions of the property fields associated with this template. There
//     * can be up to 32 properties in a single template.
//     */
//     fields: Array<DropboxTypes$file_properties$PropertyFieldTemplate>;
//   }

//   declare interface DropboxTypes$file_properties$PropertyGroupUpdate {
//     /**
//     * A unique identifier for a property template.
//     */
//     template_id: DropboxTypes$file_properties$TemplateId;

//     /**
//     * Property fields to update. If the property field already exists, it is
//     * updated. If the property field doesn't exist, the property group is
//     * added.
//     */
//     add_or_update_fields?: Array<DropboxTypes$file_properties$PropertyField>;

//     /**
//     * Property fields to remove (by name), provided they exist.
//     */
//     remove_fields?: Array<string>;
//   }

//   /**
//   * The associated property field will be of type string. Unicode is
//   * supported.
//   */
//   declare interface DropboxTypes$file_properties$PropertyTypeString {
//     ".tag": "string";
//   }

//   declare interface DropboxTypes$file_properties$PropertyTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * Data type of the given property field added.
//   */
//   declare type DropboxTypes$file_properties$PropertyType =
//     | DropboxTypes$file_properties$PropertyTypeString
//     | DropboxTypes$file_properties$PropertyTypeOther;

//   declare interface DropboxTypes$file_properties$RemovePropertiesArg {
//     /**
//     * A unique identifier for the file or folder.
//     */
//     path: DropboxTypes$file_properties$PathOrId;

//     /**
//     * A list of identifiers for a template created by templatesAddForUser()
//     * or templatesAddForTeam().
//     */
//     property_template_ids: Array<DropboxTypes$file_properties$TemplateId>;
//   }

//   declare interface DropboxTypes$file_properties$RemovePropertiesErrorPropertyGroupLookup {
//     ".tag": "property_group_lookup";
//     property_group_lookup: DropboxTypes$file_properties$LookUpPropertiesError;
//   }

//   declare type DropboxTypes$file_properties$RemovePropertiesError =
//     | DropboxTypes$file_properties$PropertiesError
//     | DropboxTypes$file_properties$RemovePropertiesErrorPropertyGroupLookup;

//   declare interface DropboxTypes$file_properties$RemoveTemplateArg {
//     /**
//     * An identifier for a template created by templatesAddForUser() or
//     * templatesAddForTeam().
//     */
//     template_id: DropboxTypes$file_properties$TemplateId;
//   }

//   /**
//   * Template does not exist for the given identifier.
//   */
//   declare interface DropboxTypes$file_properties$TemplateErrorTemplateNotFound {
//     ".tag": "template_not_found";
//     template_not_found: DropboxTypes$file_properties$TemplateId;
//   }

//   /**
//   * You do not have permission to modify this template.
//   */
//   declare interface DropboxTypes$file_properties$TemplateErrorRestrictedContent {
//     ".tag": "restricted_content";
//   }

//   declare interface DropboxTypes$file_properties$TemplateErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$TemplateError =
//     | DropboxTypes$file_properties$TemplateErrorTemplateNotFound
//     | DropboxTypes$file_properties$TemplateErrorRestrictedContent
//     | DropboxTypes$file_properties$TemplateErrorOther;

//   /**
//   * No templates will be filtered from the result (all templates will be
//   * returned).
//   */
//   declare interface DropboxTypes$file_properties$TemplateFilterFilterNone {
//     ".tag": "filter_none";
//   }

//   declare type DropboxTypes$file_properties$TemplateFilter =
//     | DropboxTypes$file_properties$TemplateFilterBase
//     | DropboxTypes$file_properties$TemplateFilterFilterNone;

//   /**
//   * Only templates with an ID in the supplied list will be returned (a subset
//   * of templates will be returned).
//   */
//   declare interface DropboxTypes$file_properties$TemplateFilterBaseFilterSome {
//     ".tag": "filter_some";
//     filter_some: Array<DropboxTypes$file_properties$TemplateId>;
//   }

//   declare interface DropboxTypes$file_properties$TemplateFilterBaseOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$TemplateFilterBase =
//     | DropboxTypes$file_properties$TemplateFilterBaseFilterSome
//     | DropboxTypes$file_properties$TemplateFilterBaseOther;

//   /**
//   * Template will be associated with a user.
//   */
//   declare interface DropboxTypes$file_properties$TemplateOwnerTypeUser {
//     ".tag": "user";
//   }

//   /**
//   * Template will be associated with a team.
//   */
//   declare interface DropboxTypes$file_properties$TemplateOwnerTypeTeam {
//     ".tag": "team";
//   }

//   declare interface DropboxTypes$file_properties$TemplateOwnerTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_properties$TemplateOwnerType =
//     | DropboxTypes$file_properties$TemplateOwnerTypeUser
//     | DropboxTypes$file_properties$TemplateOwnerTypeTeam
//     | DropboxTypes$file_properties$TemplateOwnerTypeOther;

//   declare interface DropboxTypes$file_properties$UpdatePropertiesArg {
//     /**
//     * A unique identifier for the file or folder.
//     */
//     path: DropboxTypes$file_properties$PathOrId;

//     /**
//     * The property groups "delta" updates to apply.
//     */
//     update_property_groups: Array<DropboxTypes$file_properties$PropertyGroupUpdate>;
//   }

//   declare interface DropboxTypes$file_properties$UpdatePropertiesErrorPropertyGroupLookup {
//     ".tag": "property_group_lookup";
//     property_group_lookup: DropboxTypes$file_properties$LookUpPropertiesError;
//   }

//   declare type DropboxTypes$file_properties$UpdatePropertiesError =
//     | DropboxTypes$file_properties$InvalidPropertyGroupError
//     | DropboxTypes$file_properties$UpdatePropertiesErrorPropertyGroupLookup;

//   declare interface DropboxTypes$file_properties$UpdateTemplateArg {
//     /**
//     * An identifier for template added by  See templatesAddForUser() or
//     * templatesAddForTeam().
//     */
//     template_id: DropboxTypes$file_properties$TemplateId;

//     /**
//     * A display name for the template. template names can be up to 256 bytes.
//     */
//     name?: string;

//     /**
//     * Description for the new template. Template descriptions can be up to
//     * 1024 bytes.
//     */
//     description?: string;

//     /**
//     * Property field templates to be added to the group template. There can
//     * be up to 32 properties in a single template.
//     */
//     add_fields?: Array<DropboxTypes$file_properties$PropertyFieldTemplate>;
//   }

//   declare interface DropboxTypes$file_properties$UpdateTemplateResult {
//     /**
//     * An identifier for template added by route  See templatesAddForUser() or
//     * templatesAddForTeam().
//     */
//     template_id: DropboxTypes$file_properties$TemplateId;
//   }

//   declare type DropboxTypes$file_properties$Id = string;

//   declare type DropboxTypes$file_properties$PathOrId = string;

//   declare type DropboxTypes$file_properties$PropertiesSearchCursor = string;

//   declare type DropboxTypes$file_properties$TemplateId = string;

//   /**
//   * There was an error counting the file requests.
//   */
//   declare type DropboxTypes$file_requests$CountFileRequestsError = DropboxTypes$file_requests$GeneralFileRequestsError;

//   /**
//   * Result for count().
//   */
//   declare interface DropboxTypes$file_requests$CountFileRequestsResult {
//     /**
//     * The number file requests owner by this user.
//     */
//     file_request_count: number;
//   }

//   /**
//   * Arguments for create().
//   */
//   declare interface DropboxTypes$file_requests$CreateFileRequestArgs {
//     /**
//     * The title of the file request. Must not be empty.
//     */
//     title: string;

//     /**
//     * The path of the folder in the Dropbox where uploaded files will be
//     * sent. For apps with the app folder permission, this will be relative to
//     * the app folder.
//     */
//     destination: DropboxTypes$files$Path;

//     /**
//     * The deadline for the file request. Deadlines can only be set by
//     * Professional and Business accounts.
//     */
//     deadline?: DropboxTypes$file_requests$FileRequestDeadline;

//     /**
//     * Defaults to True.
//     */
//     open?: boolean;
//   }

//   /**
//   * File requests are not available on the specified folder.
//   */
//   declare interface DropboxTypes$file_requests$CreateFileRequestErrorInvalidLocation {
//     ".tag": "invalid_location";
//   }

//   /**
//   * The user has reached the rate limit for creating file requests. The limit
//   * is currently 100 file requests per day.
//   */
//   declare interface DropboxTypes$file_requests$CreateFileRequestErrorRateLimit {
//     ".tag": "rate_limit";
//   }

//   /**
//   * There was an error creating the file request.
//   */
//   declare type DropboxTypes$file_requests$CreateFileRequestError =
//     | DropboxTypes$file_requests$FileRequestError
//     | DropboxTypes$file_requests$CreateFileRequestErrorInvalidLocation
//     | DropboxTypes$file_requests$CreateFileRequestErrorRateLimit;

//   /**
//   * There was an error deleting all closed file requests.
//   */
//   declare type DropboxTypes$file_requests$DeleteAllClosedFileRequestsError = DropboxTypes$file_requests$FileRequestError;

//   /**
//   * Result for deleteAllClosed().
//   */
//   declare interface DropboxTypes$file_requests$DeleteAllClosedFileRequestsResult {
//     /**
//     * The file requests deleted for this user.
//     */
//     file_requests: Array<DropboxTypes$file_requests$FileRequest>;
//   }

//   /**
//   * Arguments for delete().
//   */
//   declare interface DropboxTypes$file_requests$DeleteFileRequestArgs {
//     /**
//     * List IDs of the file requests to delete.
//     */
//     ids: Array<DropboxTypes$file_requests$FileRequestId>;
//   }

//   /**
//   * One or more file requests currently open.
//   */
//   declare interface DropboxTypes$file_requests$DeleteFileRequestErrorFileRequestOpen {
//     ".tag": "file_request_open";
//   }

//   /**
//   * There was an error deleting these file requests.
//   */
//   declare type DropboxTypes$file_requests$DeleteFileRequestError =
//     | DropboxTypes$file_requests$FileRequestError
//     | DropboxTypes$file_requests$DeleteFileRequestErrorFileRequestOpen;

//   /**
//   * Result for delete().
//   */
//   declare interface DropboxTypes$file_requests$DeleteFileRequestsResult {
//     /**
//     * The file requests deleted by the request.
//     */
//     file_requests: Array<DropboxTypes$file_requests$FileRequest>;
//   }

//   /**
//   * A [file request]{@link https://www.dropbox.com/help/9090} for receiving
//   * files into the user's Dropbox account.
//   */
//   declare interface DropboxTypes$file_requests$FileRequest {
//     /**
//     * The ID of the file request.
//     */
//     id: DropboxTypes$file_requests$FileRequestId;

//     /**
//     * The URL of the file request.
//     */
//     url: string;

//     /**
//     * The title of the file request.
//     */
//     title: string;

//     /**
//     * The path of the folder in the Dropbox where uploaded files will be
//     * sent. This can be null if the destination was removed. For apps with
//     * the app folder permission, this will be relative to the app folder.
//     */
//     destination?: DropboxTypes$files$Path;

//     /**
//     * When this file request was created.
//     */
//     created: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The deadline for this file request. Only set if the request has a
//     * deadline.
//     */
//     deadline?: DropboxTypes$file_requests$FileRequestDeadline;

//     /**
//     * Whether or not the file request is open. If the file request is closed,
//     * it will not accept any more file submissions.
//     */
//     is_open: boolean;

//     /**
//     * The number of files this file request has received.
//     */
//     file_count: number;
//   }

//   declare interface DropboxTypes$file_requests$FileRequestDeadline {
//     /**
//     * The deadline for this file request.
//     */
//     deadline: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * If set, allow uploads after the deadline has passed. These     uploads
//     * will be marked overdue.
//     */
//     allow_late_uploads?: DropboxTypes$file_requests$GracePeriod;
//   }

//   /**
//   * This file request ID was not found.
//   */
//   declare interface DropboxTypes$file_requests$FileRequestErrorNotFound {
//     ".tag": "not_found";
//   }

//   /**
//   * The specified path is not a folder.
//   */
//   declare interface DropboxTypes$file_requests$FileRequestErrorNotAFolder {
//     ".tag": "not_a_folder";
//   }

//   /**
//   * This file request is not accessible to this app. Apps with the app folder
//   * permission can only access file requests in their app folder.
//   */
//   declare interface DropboxTypes$file_requests$FileRequestErrorAppLacksAccess {
//     ".tag": "app_lacks_access";
//   }

//   /**
//   * This user doesn't have permission to access or modify this file request.
//   */
//   declare interface DropboxTypes$file_requests$FileRequestErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * This user's email address is not verified. File requests are only
//   * available on accounts with a verified email address. Users can verify
//   * their email address [here]{@link https://www.dropbox.com/help/317}.
//   */
//   declare interface DropboxTypes$file_requests$FileRequestErrorEmailUnverified {
//     ".tag": "email_unverified";
//   }

//   /**
//   * There was an error validating the request. For example, the title was
//   * invalid, or there were disallowed characters in the destination path.
//   */
//   declare interface DropboxTypes$file_requests$FileRequestErrorValidationError {
//     ".tag": "validation_error";
//   }

//   /**
//   * There is an error with the file request.
//   */
//   declare type DropboxTypes$file_requests$FileRequestError =
//     | DropboxTypes$file_requests$GeneralFileRequestsError
//     | DropboxTypes$file_requests$FileRequestErrorNotFound
//     | DropboxTypes$file_requests$FileRequestErrorNotAFolder
//     | DropboxTypes$file_requests$FileRequestErrorAppLacksAccess
//     | DropboxTypes$file_requests$FileRequestErrorNoPermission
//     | DropboxTypes$file_requests$FileRequestErrorEmailUnverified
//     | DropboxTypes$file_requests$FileRequestErrorValidationError;

//   /**
//   * This user's Dropbox Business team doesn't allow file requests.
//   */
//   declare interface DropboxTypes$file_requests$GeneralFileRequestsErrorDisabledForTeam {
//     ".tag": "disabled_for_team";
//   }

//   declare interface DropboxTypes$file_requests$GeneralFileRequestsErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * There is an error accessing the file requests functionality.
//   */
//   declare type DropboxTypes$file_requests$GeneralFileRequestsError =
//     | DropboxTypes$file_requests$GeneralFileRequestsErrorDisabledForTeam
//     | DropboxTypes$file_requests$GeneralFileRequestsErrorOther;

//   /**
//   * Arguments for get().
//   */
//   declare interface DropboxTypes$file_requests$GetFileRequestArgs {
//     /**
//     * The ID of the file request to retrieve.
//     */
//     id: DropboxTypes$file_requests$FileRequestId;
//   }

//   /**
//   * There was an error retrieving the specified file request.
//   */
//   declare type DropboxTypes$file_requests$GetFileRequestError = DropboxTypes$file_requests$FileRequestError;

//   declare interface DropboxTypes$file_requests$GracePeriodOneDay {
//     ".tag": "one_day";
//   }

//   declare interface DropboxTypes$file_requests$GracePeriodTwoDays {
//     ".tag": "two_days";
//   }

//   declare interface DropboxTypes$file_requests$GracePeriodSevenDays {
//     ".tag": "seven_days";
//   }

//   declare interface DropboxTypes$file_requests$GracePeriodThirtyDays {
//     ".tag": "thirty_days";
//   }

//   declare interface DropboxTypes$file_requests$GracePeriodAlways {
//     ".tag": "always";
//   }

//   declare interface DropboxTypes$file_requests$GracePeriodOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_requests$GracePeriod =
//     | DropboxTypes$file_requests$GracePeriodOneDay
//     | DropboxTypes$file_requests$GracePeriodTwoDays
//     | DropboxTypes$file_requests$GracePeriodSevenDays
//     | DropboxTypes$file_requests$GracePeriodThirtyDays
//     | DropboxTypes$file_requests$GracePeriodAlways
//     | DropboxTypes$file_requests$GracePeriodOther;

//   /**
//   * Arguments for listV2().
//   */
//   declare interface DropboxTypes$file_requests$ListFileRequestsArg {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$file_requests$ListFileRequestsContinueArg {
//     /**
//     * The cursor returned by the previous API call specified in the endpoint
//     * description.
//     */
//     cursor: string;
//   }

//   /**
//   * The cursor is invalid.
//   */
//   declare interface DropboxTypes$file_requests$ListFileRequestsContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   /**
//   * There was an error retrieving the file requests.
//   */
//   declare type DropboxTypes$file_requests$ListFileRequestsContinueError =
//     | DropboxTypes$file_requests$GeneralFileRequestsError
//     | DropboxTypes$file_requests$ListFileRequestsContinueErrorInvalidCursor;

//   /**
//   * There was an error retrieving the file requests.
//   */
//   declare type DropboxTypes$file_requests$ListFileRequestsError = DropboxTypes$file_requests$GeneralFileRequestsError;

//   /**
//   * Result for list().
//   */
//   declare interface DropboxTypes$file_requests$ListFileRequestsResult {
//     /**
//     * The file requests owned by this user. Apps with the app folder
//     * permission will only see file requests in their app folder.
//     */
//     file_requests: Array<DropboxTypes$file_requests$FileRequest>;
//   }

//   /**
//   * Result for listV2() and listContinue().
//   */
//   declare interface DropboxTypes$file_requests$ListFileRequestsV2Result {
//     /**
//     * The file requests owned by this user. Apps with the app folder
//     * permission will only see file requests in their app folder.
//     */
//     file_requests: Array<DropboxTypes$file_requests$FileRequest>;

//     /**
//     * Pass the cursor into listContinue() to obtain additional file requests.
//     */
//     cursor: string;

//     /**
//     * Is true if there are additional file requests that have not been
//     * returned yet. An additional call to :route:list/continue` can retrieve
//     * them.
//     */
//     has_more: boolean;
//   }

//   /**
//   * Arguments for update().
//   */
//   declare interface DropboxTypes$file_requests$UpdateFileRequestArgs {
//     /**
//     * The ID of the file request to update.
//     */
//     id: DropboxTypes$file_requests$FileRequestId;

//     /**
//     * The new title of the file request. Must not be empty.
//     */
//     title?: string;

//     /**
//     * The new path of the folder in the Dropbox where uploaded files will be
//     * sent. For apps with the app folder permission, this will be relative to
//     * the app folder.
//     */
//     destination?: DropboxTypes$files$Path;

//     /**
//     * Defaults to TagRef(Union(u'UpdateFileRequestDeadline',
//     * [UnionField(u'no_update', Void, False, None), UnionField(u'update',
//     * Nullable, False, None), UnionField(u'other', Void, True, None)]),
//     * u'no_update').
//     */
//     deadline?: DropboxTypes$file_requests$UpdateFileRequestDeadline;

//     /**
//     * Whether to set this file request as open or closed.
//     */
//     open?: boolean;
//   }

//   /**
//   * Do not change the file request's deadline.
//   */
//   declare interface DropboxTypes$file_requests$UpdateFileRequestDeadlineNoUpdate {
//     ".tag": "no_update";
//   }

//   /**
//   * If null, the file request's deadline is cleared.
//   */
//   declare interface DropboxTypes$file_requests$UpdateFileRequestDeadlineUpdate {
//     ".tag": "update";
//     update: Object;
//   }

//   declare interface DropboxTypes$file_requests$UpdateFileRequestDeadlineOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$file_requests$UpdateFileRequestDeadline =
//     | DropboxTypes$file_requests$UpdateFileRequestDeadlineNoUpdate
//     | DropboxTypes$file_requests$UpdateFileRequestDeadlineUpdate
//     | DropboxTypes$file_requests$UpdateFileRequestDeadlineOther;

//   /**
//   * There is an error updating the file request.
//   */
//   declare type DropboxTypes$file_requests$UpdateFileRequestError = DropboxTypes$file_requests$FileRequestError;

//   declare type DropboxTypes$file_requests$FileRequestId = string;

//   declare type DropboxTypes$file_requests$FileRequestValidationError = Object;

//   declare type DropboxTypes$files$AlphaGetMetadataArg = {
//     /**
//     * If set to a valid list of template IDs, FileMetadata.property_groups is
//     * set for files with custom properties.
//     */
//     include_property_templates?: Array<DropboxTypes$file_properties$TemplateId>,
//     ...
//   } & DropboxTypes$files$GetMetadataArg;

//   declare interface DropboxTypes$files$AlphaGetMetadataErrorPropertiesError {
//     ".tag": "properties_error";
//     properties_error: DropboxTypes$file_properties$LookUpPropertiesError;
//   }

//   declare type DropboxTypes$files$AlphaGetMetadataError =
//     | DropboxTypes$files$GetMetadataError
//     | DropboxTypes$files$AlphaGetMetadataErrorPropertiesError;

//   declare interface DropboxTypes$files$CommitInfo {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object;

//     /**
//     * Path in the user's Dropbox to save the file.
//     */
//     path: DropboxTypes$files$WritePathOrId;

//     /**
//     * Defaults to TagRef(Union(u'WriteMode', [UnionField(u'add', Void, False,
//     * None), UnionField(u'overwrite', Void, False, None),
//     * UnionField(u'update', Alias(u'Rev', String), False, None)]), u'add').
//     */
//     mode?: DropboxTypes$files$WriteMode;

//     /**
//     * Defaults to False.
//     */
//     autorename?: boolean;

//     /**
//     * The value to store as the client_modified timestamp. Dropbox
//     * automatically records the time at which the file was written to the
//     * Dropbox servers. It can also record an additional timestamp, provided
//     * by Dropbox desktop clients, mobile clients, and API apps of when the
//     * file was actually created or modified.
//     */
//     client_modified?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * Defaults to False.
//     */
//     mute?: boolean;

//     /**
//     * List of custom properties to add to file.
//     */
//     property_groups?: Array<DropboxTypes$file_properties$PropertyGroup>;

//     /**
//     * Defaults to False.
//     */
//     strict_conflict?: boolean;
//   }

//   declare type DropboxTypes$files$CommitInfoWithProperties = {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object,
//     ...
//   } & DropboxTypes$files$CommitInfo;

//   declare interface DropboxTypes$files$ContentSyncSetting {
//     /**
//     * Id of the item this setting is applied to.
//     */
//     id: DropboxTypes$files$FileId;

//     /**
//     * Setting for this item.
//     */
//     sync_setting: DropboxTypes$files$SyncSetting;
//   }

//   declare interface DropboxTypes$files$ContentSyncSettingArg {
//     /**
//     * Id of the item this setting is applied to.
//     */
//     id: DropboxTypes$files$FileId;

//     /**
//     * Setting for this item.
//     */
//     sync_setting: DropboxTypes$files$SyncSettingArg;
//   }

//   declare interface DropboxTypes$files$CreateFolderArg {
//     /**
//     * Path in the user's Dropbox to create.
//     */
//     path: DropboxTypes$files$WritePath;

//     /**
//     * Defaults to False.
//     */
//     autorename?: boolean;
//   }

//   declare interface DropboxTypes$files$CreateFolderBatchArg {
//     /**
//     * List of paths to be created in the user's Dropbox. Duplicate path
//     * arguments in the batch are considered only once.
//     */
//     paths: Array<DropboxTypes$files$WritePath>;

//     /**
//     * Defaults to False.
//     */
//     autorename?: boolean;

//     /**
//     * Defaults to False.
//     */
//     force_async?: boolean;
//   }

//   /**
//   * The operation would involve too many files or folders.
//   */
//   declare interface DropboxTypes$files$CreateFolderBatchErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   declare interface DropboxTypes$files$CreateFolderBatchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$CreateFolderBatchError =
//     | DropboxTypes$files$CreateFolderBatchErrorTooManyFiles
//     | DropboxTypes$files$CreateFolderBatchErrorOther;

//   /**
//   * The batch create folder has finished.
//   */
//   declare type DropboxTypes$files$CreateFolderBatchJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$CreateFolderBatchResult;

//   /**
//   * The batch create folder has failed.
//   */
//   declare interface DropboxTypes$files$CreateFolderBatchJobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$files$CreateFolderBatchError;
//   }

//   declare interface DropboxTypes$files$CreateFolderBatchJobStatusOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$CreateFolderBatchJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$files$CreateFolderBatchJobStatusComplete
//     | DropboxTypes$files$CreateFolderBatchJobStatusFailed
//     | DropboxTypes$files$CreateFolderBatchJobStatusOther;

//   declare type DropboxTypes$files$CreateFolderBatchLaunchComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$CreateFolderBatchResult;

//   declare interface DropboxTypes$files$CreateFolderBatchLaunchOther {
//     ".tag": "other";
//   }

//   /**
//   * Result returned by createFolderBatch() that may either launch an
//   * asynchronous job or complete synchronously.
//   */
//   declare type DropboxTypes$files$CreateFolderBatchLaunch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$files$CreateFolderBatchLaunchComplete
//     | DropboxTypes$files$CreateFolderBatchLaunchOther;

//   declare type DropboxTypes$files$CreateFolderBatchResult = {
//     /**
//     * Each entry in CreateFolderBatchArg.paths will appear at the same
//     * position inside CreateFolderBatchResult.entries.
//     */
//     entries: Array<DropboxTypes$files$CreateFolderBatchResultEntry>,
//     ...
//   } & DropboxTypes$files$FileOpsResult;

//   declare type DropboxTypes$files$CreateFolderBatchResultEntrySuccess = {
//     ".tag": "success",
//     ...
//   } & DropboxTypes$files$CreateFolderEntryResult;

//   declare interface DropboxTypes$files$CreateFolderBatchResultEntryFailure {
//     ".tag": "failure";
//     failure: DropboxTypes$files$CreateFolderEntryError;
//   }

//   declare type DropboxTypes$files$CreateFolderBatchResultEntry =
//     | DropboxTypes$files$CreateFolderBatchResultEntrySuccess
//     | DropboxTypes$files$CreateFolderBatchResultEntryFailure;

//   declare interface DropboxTypes$files$CreateFolderEntryErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$WriteError;
//   }

//   declare interface DropboxTypes$files$CreateFolderEntryErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$CreateFolderEntryError =
//     | DropboxTypes$files$CreateFolderEntryErrorPath
//     | DropboxTypes$files$CreateFolderEntryErrorOther;

//   declare interface DropboxTypes$files$CreateFolderEntryResult {
//     /**
//     * Metadata of the created folder.
//     */
//     metadata: DropboxTypes$files$FolderMetadata;
//   }

//   declare interface DropboxTypes$files$CreateFolderErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$WriteError;
//   }

//   declare type DropboxTypes$files$CreateFolderError = DropboxTypes$files$CreateFolderErrorPath;

//   declare type DropboxTypes$files$CreateFolderResult = {
//     /**
//     * Metadata of the created folder.
//     */
//     metadata: DropboxTypes$files$FolderMetadata,
//     ...
//   } & DropboxTypes$files$FileOpsResult;

//   declare interface DropboxTypes$files$DeleteArg {
//     /**
//     * Path in the user's Dropbox to delete.
//     */
//     path: DropboxTypes$files$WritePathOrId;

//     /**
//     * Perform delete if given "rev" matches the existing file's latest "rev".
//     * This field does not support deleting a folder.
//     */
//     parent_rev?: DropboxTypes$files$Rev;
//   }

//   declare interface DropboxTypes$files$DeleteBatchArg {
//     entries: Array<DropboxTypes$files$DeleteArg>;
//   }

//   /**
//   * Use DeleteError.too_many_write_operations. deleteBatch() now provides
//   * smaller granularity about which entry has failed because of this.
//   */
//   declare interface DropboxTypes$files$DeleteBatchErrorTooManyWriteOperations {
//     ".tag": "too_many_write_operations";
//   }

//   declare interface DropboxTypes$files$DeleteBatchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$DeleteBatchError =
//     | DropboxTypes$files$DeleteBatchErrorTooManyWriteOperations
//     | DropboxTypes$files$DeleteBatchErrorOther;

//   /**
//   * The batch delete has finished.
//   */
//   declare type DropboxTypes$files$DeleteBatchJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$DeleteBatchResult;

//   /**
//   * The batch delete has failed.
//   */
//   declare interface DropboxTypes$files$DeleteBatchJobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$files$DeleteBatchError;
//   }

//   declare interface DropboxTypes$files$DeleteBatchJobStatusOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$DeleteBatchJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$files$DeleteBatchJobStatusComplete
//     | DropboxTypes$files$DeleteBatchJobStatusFailed
//     | DropboxTypes$files$DeleteBatchJobStatusOther;

//   declare type DropboxTypes$files$DeleteBatchLaunchComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$DeleteBatchResult;

//   declare interface DropboxTypes$files$DeleteBatchLaunchOther {
//     ".tag": "other";
//   }

//   /**
//   * Result returned by deleteBatch() that may either launch an asynchronous
//   * job or complete synchronously.
//   */
//   declare type DropboxTypes$files$DeleteBatchLaunch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$files$DeleteBatchLaunchComplete
//     | DropboxTypes$files$DeleteBatchLaunchOther;

//   declare type DropboxTypes$files$DeleteBatchResult = {
//     /**
//     * Each entry in DeleteBatchArg.entries will appear at the same position
//     * inside DeleteBatchResult.entries.
//     */
//     entries: Array<DropboxTypes$files$DeleteBatchResultEntry>,
//     ...
//   } & DropboxTypes$files$FileOpsResult;

//   declare interface DropboxTypes$files$DeleteBatchResultData {
//     /**
//     * Metadata of the deleted object.
//     */
//     metadata:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference;
//   }

//   declare type DropboxTypes$files$DeleteBatchResultEntrySuccess = {
//     ".tag": "success",
//     ...
//   } & DropboxTypes$files$DeleteBatchResultData;

//   declare interface DropboxTypes$files$DeleteBatchResultEntryFailure {
//     ".tag": "failure";
//     failure: DropboxTypes$files$DeleteError;
//   }

//   declare type DropboxTypes$files$DeleteBatchResultEntry =
//     | DropboxTypes$files$DeleteBatchResultEntrySuccess
//     | DropboxTypes$files$DeleteBatchResultEntryFailure;

//   declare interface DropboxTypes$files$DeleteErrorPathLookup {
//     ".tag": "path_lookup";
//     path_lookup: DropboxTypes$files$LookupError;
//   }

//   declare interface DropboxTypes$files$DeleteErrorPathWrite {
//     ".tag": "path_write";
//     path_write: DropboxTypes$files$WriteError;
//   }

//   /**
//   * There are too many write operations in user's Dropbox. Please retry this
//   * request.
//   */
//   declare interface DropboxTypes$files$DeleteErrorTooManyWriteOperations {
//     ".tag": "too_many_write_operations";
//   }

//   /**
//   * There are too many files in one request. Please retry with fewer files.
//   */
//   declare interface DropboxTypes$files$DeleteErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   declare interface DropboxTypes$files$DeleteErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$DeleteError =
//     | DropboxTypes$files$DeleteErrorPathLookup
//     | DropboxTypes$files$DeleteErrorPathWrite
//     | DropboxTypes$files$DeleteErrorTooManyWriteOperations
//     | DropboxTypes$files$DeleteErrorTooManyFiles
//     | DropboxTypes$files$DeleteErrorOther;

//   declare type DropboxTypes$files$DeleteResult = {
//     /**
//     * Metadata of the deleted object.
//     */
//     metadata:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference,
//     ...
//   } & DropboxTypes$files$FileOpsResult;

//   /**
//   * Indicates that there used to be a file or folder at this path, but it no
//   * longer exists.
//   */
//   declare type DropboxTypes$files$DeletedMetadata = {
//     ...
//   } & DropboxTypes$files$Metadata;

//   /**
//   * Reference to the DeletedMetadata type, identified by the value of the
//   * .tag property.
//   */
//   declare type DropboxTypes$files$DeletedMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "deleted",
//     ...
//   } & DropboxTypes$files$DeletedMetadata;

//   /**
//   * Dimensions for a photo or video.
//   */
//   declare interface DropboxTypes$files$Dimensions {
//     /**
//     * Height of the photo/video.
//     */
//     height: number;

//     /**
//     * Width of the photo/video.
//     */
//     width: number;
//   }

//   declare interface DropboxTypes$files$DownloadArg {
//     /**
//     * The path of the file to download.
//     */
//     path: DropboxTypes$files$ReadPath;

//     /**
//     * Please specify revision in path instead.
//     */
//     rev?: DropboxTypes$files$Rev;
//   }

//   declare interface DropboxTypes$files$DownloadErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * This file type cannot be downloaded directly; use declare() instead.
//   */
//   declare interface DropboxTypes$files$DownloadErrorUnsupportedFile {
//     ".tag": "unsupported_file";
//   }

//   declare interface DropboxTypes$files$DownloadErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$DownloadError =
//     | DropboxTypes$files$DownloadErrorPath
//     | DropboxTypes$files$DownloadErrorUnsupportedFile
//     | DropboxTypes$files$DownloadErrorOther;

//   declare interface DropboxTypes$files$DownloadZipArg {
//     /**
//     * The path of the folder to download.
//     */
//     path: DropboxTypes$files$ReadPath;
//   }

//   declare interface DropboxTypes$files$DownloadZipErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * The folder or a file is too large to download.
//   */
//   declare interface DropboxTypes$files$DownloadZipErrorTooLarge {
//     ".tag": "too_large";
//   }

//   /**
//   * The folder has too many files to download.
//   */
//   declare interface DropboxTypes$files$DownloadZipErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   declare interface DropboxTypes$files$DownloadZipErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$DownloadZipError =
//     | DropboxTypes$files$DownloadZipErrorPath
//     | DropboxTypes$files$DownloadZipErrorTooLarge
//     | DropboxTypes$files$DownloadZipErrorTooManyFiles
//     | DropboxTypes$files$DownloadZipErrorOther;

//   declare interface DropboxTypes$files$DownloadZipResult {
//     metadata: DropboxTypes$files$FolderMetadata;
//   }

//   declare interface DropboxTypes$files$ExportArg {
//     /**
//     * The path of the file to be exported.
//     */
//     path: DropboxTypes$files$ReadPath;
//   }

//   declare interface DropboxTypes$files$ExportErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * This file type cannot be exported. Use download() instead.
//   */
//   declare interface DropboxTypes$files$ExportErrorNonExportable {
//     ".tag": "non_exportable";
//   }

//   declare interface DropboxTypes$files$ExportErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$ExportError =
//     | DropboxTypes$files$ExportErrorPath
//     | DropboxTypes$files$ExportErrorNonExportable
//     | DropboxTypes$files$ExportErrorOther;

//   /**
//   * Export information for a file.
//   */
//   declare interface DropboxTypes$files$ExportInfo {
//     /**
//     * Format to which the file can be exported to.
//     */
//     export_as?: string;
//   }

//   declare interface DropboxTypes$files$ExportMetadata {
//     /**
//     * The last component of the path (including extension). This never
//     * contains a slash.
//     */
//     name: string;

//     /**
//     * The file size in bytes.
//     */
//     size: number;

//     /**
//     * A hash based on the exported file content. This field can be used to
//     * verify data integrity. Similar to content hash. For more information
//     * see our [Content hash]{@link
//     * https://www.dropbox.com/developers/reference/content-hash} page.
//     */
//     export_hash?: DropboxTypes$files$Sha256HexHash;
//   }

//   declare interface DropboxTypes$files$ExportResult {
//     /**
//     * Metadata for the exported version of the file.
//     */
//     export_metadata: DropboxTypes$files$ExportMetadata;

//     /**
//     * Metadata for the original file.
//     */
//     file_metadata: DropboxTypes$files$FileMetadata;
//   }

//   declare type DropboxTypes$files$FileMetadata = {
//     /**
//     * A unique identifier for the file.
//     */
//     id: DropboxTypes$files$Id,

//     /**
//     * For files, this is the modification time set by the desktop client when
//     * the file was added to Dropbox. Since this time is not verified (the
//     * Dropbox server stores whatever the desktop client sends up), this
//     * should only be used for display purposes (such as sorting) and not, for
//     * example, to determine if a file has changed or not.
//     */
//     client_modified: DropboxTypes$common$DropboxTimestamp,

//     /**
//     * The last time the file was modified on Dropbox.
//     */
//     server_modified: DropboxTypes$common$DropboxTimestamp,

//     /**
//     * A unique identifier for the current revision of a file. This field is
//     * the same rev as elsewhere in the API and can be used to detect changes
//     * and avoid conflicts.
//     */
//     rev: DropboxTypes$files$Rev,

//     /**
//     * The file size in bytes.
//     */
//     size: number,

//     /**
//     * Additional information if the file is a photo or video. This field will
//     * not be set on entries returned by listFolder(), listFolderContinue(),
//     * or getThumbnailBatch(), starting December 2, 2019.
//     */
//     media_info?: DropboxTypes$files$MediaInfo,

//     /**
//     * Set if this file is a symlink.
//     */
//     symlink_info?: DropboxTypes$files$SymlinkInfo,

//     /**
//     * Set if this file is contained in a shared folder.
//     */
//     sharing_info?: DropboxTypes$files$FileSharingInfo,

//     /**
//     * Defaults to True.
//     */
//     is_downloadable?: boolean,

//     /**
//     * Information about format this file can be exported to. This filed must
//     * be set if is_downloadable is set to false.
//     */
//     export_info?: DropboxTypes$files$ExportInfo,

//     /**
//     * Additional information if the file has custom properties with the
//     * property template specified.
//     */
//     property_groups?: Array<DropboxTypes$file_properties$PropertyGroup>,

//     /**
//     * This flag will only be present if include_has_explicit_shared_members
//     * is true in listFolder() or getMetadata(). If this  flag is present, it
//     * will be true if this file has any explicit shared  members. This is
//     * different from sharing_info in that this could be true  in the case
//     * where a file has explicit members but is not contained within  a shared
//     * folder.
//     */
//     has_explicit_shared_members?: boolean,

//     /**
//     * A hash of the file content. This field can be used to verify data
//     * integrity. For more information see our [Content hash]{@link
//     * https://www.dropbox.com/developers/reference/content-hash} page.
//     */
//     content_hash?: DropboxTypes$files$Sha256HexHash,
//     ...
//   } & DropboxTypes$files$Metadata;

//   /**
//   * Reference to the FileMetadata type, identified by the value of the .tag
//   * property.
//   */
//   declare type DropboxTypes$files$FileMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "file",
//     ...
//   } & DropboxTypes$files$FileMetadata;

//   declare interface DropboxTypes$files$FileOpsResult {}

//   /**
//   * Sharing info for a file which is contained by a shared folder.
//   */
//   declare type DropboxTypes$files$FileSharingInfo = {
//     /**
//     * ID of shared folder that holds this file.
//     */
//     parent_shared_folder_id: DropboxTypes$common$SharedFolderId,

//     /**
//     * The last user who modified the file. This field will be null if the
//     * user's account has been deleted.
//     */
//     modified_by?: DropboxTypes$users_common$AccountId,
//     ...
//   } & DropboxTypes$files$SharingInfo;

//   declare type DropboxTypes$files$FolderMetadata = {
//     /**
//     * A unique identifier for the folder.
//     */
//     id: DropboxTypes$files$Id,

//     /**
//     * Please use sharing_info instead.
//     */
//     shared_folder_id?: DropboxTypes$common$SharedFolderId,

//     /**
//     * Set if the folder is contained in a shared folder or is a shared folder
//     * mount point.
//     */
//     sharing_info?: DropboxTypes$files$FolderSharingInfo,

//     /**
//     * Additional information if the file has custom properties with the
//     * property template specified. Note that only properties associated with
//     * user-owned templates, not team-owned templates, can be attached to
//     * folders.
//     */
//     property_groups?: Array<DropboxTypes$file_properties$PropertyGroup>,
//     ...
//   } & DropboxTypes$files$Metadata;

//   /**
//   * Reference to the FolderMetadata type, identified by the value of the .tag
//   * property.
//   */
//   declare type DropboxTypes$files$FolderMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "folder",
//     ...
//   } & DropboxTypes$files$FolderMetadata;

//   /**
//   * Sharing info for a folder which is contained in a shared folder or is a
//   * shared folder mount point.
//   */
//   declare type DropboxTypes$files$FolderSharingInfo = {
//     /**
//     * Set if the folder is contained by a shared folder.
//     */
//     parent_shared_folder_id?: DropboxTypes$common$SharedFolderId,

//     /**
//     * If this folder is a shared folder mount point, the ID of the shared
//     * folder mounted at this location.
//     */
//     shared_folder_id?: DropboxTypes$common$SharedFolderId,

//     /**
//     * Defaults to False.
//     */
//     traverse_only?: boolean,

//     /**
//     * Defaults to False.
//     */
//     no_access?: boolean,
//     ...
//   } & DropboxTypes$files$SharingInfo;

//   declare interface DropboxTypes$files$GetCopyReferenceArg {
//     /**
//     * The path to the file or folder you want to get a copy reference to.
//     */
//     path: DropboxTypes$files$ReadPath;
//   }

//   declare interface DropboxTypes$files$GetCopyReferenceErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   declare interface DropboxTypes$files$GetCopyReferenceErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$GetCopyReferenceError =
//     | DropboxTypes$files$GetCopyReferenceErrorPath
//     | DropboxTypes$files$GetCopyReferenceErrorOther;

//   declare interface DropboxTypes$files$GetCopyReferenceResult {
//     /**
//     * Metadata of the file or folder.
//     */
//     metadata:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference;

//     /**
//     * A copy reference to the file or folder.
//     */
//     copy_reference: string;

//     /**
//     * The expiration date of the copy reference. This value is currently set
//     * to be far enough in the future so that expiration is effectively not an
//     * issue.
//     */
//     expires: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$files$GetMetadataArg {
//     /**
//     * The path of a file or folder on Dropbox.
//     */
//     path: DropboxTypes$files$ReadPath;

//     /**
//     * Defaults to False.
//     */
//     include_media_info?: boolean;

//     /**
//     * Defaults to False.
//     */
//     include_deleted?: boolean;

//     /**
//     * Defaults to False.
//     */
//     include_has_explicit_shared_members?: boolean;

//     /**
//     * If set to a valid list of template IDs, FileMetadata.property_groups is
//     * set if there exists property data associated with the file and each of
//     * the listed templates.
//     */
//     include_property_groups?: DropboxTypes$file_properties$TemplateFilterBase;
//   }

//   declare interface DropboxTypes$files$GetMetadataErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   declare type DropboxTypes$files$GetMetadataError = DropboxTypes$files$GetMetadataErrorPath;

//   declare interface DropboxTypes$files$GetTemporaryLinkArg {
//     /**
//     * The path to the file you want a temporary link to.
//     */
//     path: DropboxTypes$files$ReadPath;
//   }

//   declare interface DropboxTypes$files$GetTemporaryLinkErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * The user's email address needs to be verified to use this functionality.
//   */
//   declare interface DropboxTypes$files$GetTemporaryLinkErrorEmailNotVerified {
//     ".tag": "email_not_verified";
//   }

//   /**
//   * Cannot get temporary link to this file type; use declare() instead.
//   */
//   declare interface DropboxTypes$files$GetTemporaryLinkErrorUnsupportedFile {
//     ".tag": "unsupported_file";
//   }

//   declare interface DropboxTypes$files$GetTemporaryLinkErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$GetTemporaryLinkError =
//     | DropboxTypes$files$GetTemporaryLinkErrorPath
//     | DropboxTypes$files$GetTemporaryLinkErrorEmailNotVerified
//     | DropboxTypes$files$GetTemporaryLinkErrorUnsupportedFile
//     | DropboxTypes$files$GetTemporaryLinkErrorOther;

//   declare interface DropboxTypes$files$GetTemporaryLinkResult {
//     /**
//     * Metadata of the file.
//     */
//     metadata: DropboxTypes$files$FileMetadata;

//     /**
//     * The temporary link which can be used to stream content the file.
//     */
//     link: string;
//   }

//   declare interface DropboxTypes$files$GetTemporaryUploadLinkArg {
//     /**
//     * Contains the path and other optional modifiers for the future upload
//     * commit. Equivalent to the parameters provided to upload().
//     */
//     commit_info: DropboxTypes$files$CommitInfo;

//     /**
//     * Defaults to 14400.0.
//     */
//     duration?: number;
//   }

//   declare interface DropboxTypes$files$GetTemporaryUploadLinkResult {
//     /**
//     * The temporary link which can be used to stream a file to a Dropbox
//     * location.
//     */
//     link: string;
//   }

//   /**
//   * Arguments for getThumbnailBatch().
//   */
//   declare interface DropboxTypes$files$GetThumbnailBatchArg {
//     /**
//     * List of files to get thumbnails.
//     */
//     entries: Array<DropboxTypes$files$ThumbnailArg>;
//   }

//   /**
//   * The operation involves more than 25 files.
//   */
//   declare interface DropboxTypes$files$GetThumbnailBatchErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   declare interface DropboxTypes$files$GetThumbnailBatchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$GetThumbnailBatchError =
//     | DropboxTypes$files$GetThumbnailBatchErrorTooManyFiles
//     | DropboxTypes$files$GetThumbnailBatchErrorOther;

//   declare interface DropboxTypes$files$GetThumbnailBatchResult {
//     /**
//     * List of files and their thumbnails.
//     */
//     entries: Array<DropboxTypes$files$GetThumbnailBatchResultEntry>;
//   }

//   declare interface DropboxTypes$files$GetThumbnailBatchResultData {
//     metadata: DropboxTypes$files$FileMetadata;

//     /**
//     * A string containing the base64-encoded thumbnail data for this file.
//     */
//     thumbnail: string;
//   }

//   declare type DropboxTypes$files$GetThumbnailBatchResultEntrySuccess = {
//     ".tag": "success",
//     ...
//   } & DropboxTypes$files$GetThumbnailBatchResultData;

//   /**
//   * The result for this file if it was an error.
//   */
//   declare interface DropboxTypes$files$GetThumbnailBatchResultEntryFailure {
//     ".tag": "failure";
//     failure: DropboxTypes$files$ThumbnailError;
//   }

//   declare interface DropboxTypes$files$GetThumbnailBatchResultEntryOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$GetThumbnailBatchResultEntry =
//     | DropboxTypes$files$GetThumbnailBatchResultEntrySuccess
//     | DropboxTypes$files$GetThumbnailBatchResultEntryFailure
//     | DropboxTypes$files$GetThumbnailBatchResultEntryOther;

//   /**
//   * GPS coordinates for a photo or video.
//   */
//   declare interface DropboxTypes$files$GpsCoordinates {
//     /**
//     * Latitude of the GPS coordinates.
//     */
//     latitude: number;

//     /**
//     * Longitude of the GPS coordinates.
//     */
//     longitude: number;
//   }

//   declare interface DropboxTypes$files$ListFolderArg {
//     /**
//     * A unique identifier for the file.
//     */
//     path: DropboxTypes$files$PathROrId;

//     /**
//     * Defaults to False.
//     */
//     recursive?: boolean;

//     /**
//     * Defaults to False.
//     */
//     include_media_info?: boolean;

//     /**
//     * Defaults to False.
//     */
//     include_deleted?: boolean;

//     /**
//     * Defaults to False.
//     */
//     include_has_explicit_shared_members?: boolean;

//     /**
//     * Defaults to True.
//     */
//     include_mounted_folders?: boolean;

//     /**
//     * The maximum number of results to return per request. Note: This is an
//     * approximate number and there can be slightly more entries returned in
//     * some cases.
//     */
//     limit?: number;

//     /**
//     * A shared link to list the contents of. If the link is
//     * password-protected, the password must be provided. If this field is
//     * present, ListFolderArg.path will be relative to root of the shared
//     * link. Only non-recursive mode is supported for shared link.
//     */
//     shared_link?: DropboxTypes$files$SharedLink;

//     /**
//     * If set to a valid list of template IDs, FileMetadata.property_groups is
//     * set if there exists property data associated with the file and each of
//     * the listed templates.
//     */
//     include_property_groups?: DropboxTypes$file_properties$TemplateFilterBase;

//     /**
//     * Defaults to True.
//     */
//     include_non_downloadable_files?: boolean;
//   }

//   declare interface DropboxTypes$files$ListFolderContinueArg {
//     /**
//     * The cursor returned by your last call to listFolder() or
//     * listFolderContinue().
//     */
//     cursor: DropboxTypes$files$ListFolderCursor;
//   }

//   declare interface DropboxTypes$files$ListFolderContinueErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call listFolder() to
//   * obtain a new cursor.
//   */
//   declare interface DropboxTypes$files$ListFolderContinueErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$files$ListFolderContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$ListFolderContinueError =
//     | DropboxTypes$files$ListFolderContinueErrorPath
//     | DropboxTypes$files$ListFolderContinueErrorReset
//     | DropboxTypes$files$ListFolderContinueErrorOther;

//   declare interface DropboxTypes$files$ListFolderErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   declare interface DropboxTypes$files$ListFolderErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$ListFolderError =
//     | DropboxTypes$files$ListFolderErrorPath
//     | DropboxTypes$files$ListFolderErrorOther;

//   declare interface DropboxTypes$files$ListFolderGetLatestCursorResult {
//     /**
//     * Pass the cursor into listFolderContinue() to see what's changed in the
//     * folder since your previous query.
//     */
//     cursor: DropboxTypes$files$ListFolderCursor;
//   }

//   declare interface DropboxTypes$files$ListFolderLongpollArg {
//     /**
//     * A cursor as returned by listFolder() or listFolderContinue(). Cursors
//     * retrieved by setting ListFolderArg.include_media_info to true are not
//     * supported.
//     */
//     cursor: DropboxTypes$files$ListFolderCursor;

//     /**
//     * Defaults to 30.
//     */
//     timeout?: number;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call listFolder() to
//   * obtain a new cursor.
//   */
//   declare interface DropboxTypes$files$ListFolderLongpollErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$files$ListFolderLongpollErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$ListFolderLongpollError =
//     | DropboxTypes$files$ListFolderLongpollErrorReset
//     | DropboxTypes$files$ListFolderLongpollErrorOther;

//   declare interface DropboxTypes$files$ListFolderLongpollResult {
//     /**
//     * Indicates whether new changes are available. If true, call
//     * listFolderContinue() to retrieve the changes.
//     */
//     changes: boolean;

//     /**
//     * If present, backoff for at least this many seconds before calling
//     * listFolderLongpoll() again.
//     */
//     backoff?: number;
//   }

//   declare interface DropboxTypes$files$ListFolderResult {
//     /**
//     * The files and (direct) subfolders in the folder.
//     */
//     entries: Array<
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference
//     >;

//     /**
//     * Pass the cursor into listFolderContinue() to see what's changed in the
//     * folder since your previous query.
//     */
//     cursor: DropboxTypes$files$ListFolderCursor;

//     /**
//     * If true, then there are more entries available. Pass the cursor to
//     * listFolderContinue() to retrieve the rest.
//     */
//     has_more: boolean;
//   }

//   declare interface DropboxTypes$files$ListRevisionsArg {
//     /**
//     * The path to the file you want to see the revisions of.
//     */
//     path: DropboxTypes$files$PathOrId;

//     /**
//     * Defaults to TagRef(Union(u'ListRevisionsMode', [UnionField(u'path',
//     * Void, False, None), UnionField(u'id', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'path').
//     */
//     mode?: DropboxTypes$files$ListRevisionsMode;

//     /**
//     * Defaults to 10.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$files$ListRevisionsErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   declare interface DropboxTypes$files$ListRevisionsErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$ListRevisionsError =
//     | DropboxTypes$files$ListRevisionsErrorPath
//     | DropboxTypes$files$ListRevisionsErrorOther;

//   /**
//   * Returns revisions with the same file path as identified by the latest
//   * file entry at the given file path or id.
//   */
//   declare interface DropboxTypes$files$ListRevisionsModePath {
//     ".tag": "path";
//   }

//   /**
//   * Returns revisions with the same file id as identified by the latest file
//   * entry at the given file path or id.
//   */
//   declare interface DropboxTypes$files$ListRevisionsModeId {
//     ".tag": "id";
//   }

//   declare interface DropboxTypes$files$ListRevisionsModeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$ListRevisionsMode =
//     | DropboxTypes$files$ListRevisionsModePath
//     | DropboxTypes$files$ListRevisionsModeId
//     | DropboxTypes$files$ListRevisionsModeOther;

//   declare interface DropboxTypes$files$ListRevisionsResult {
//     /**
//     * If the file identified by the latest revision in the response is either
//     * deleted or moved.
//     */
//     is_deleted: boolean;

//     /**
//     * The time of deletion if the file was deleted.
//     */
//     server_deleted?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The revisions for the file. Only revisions that are not deleted will
//     * show up here.
//     */
//     entries: Array<DropboxTypes$files$FileMetadata>;
//   }

//   /**
//   * The given path does not satisfy the required path format. Please refer to
//   * the [Path formats documentation]{@link
//   * https://www.dropbox.com/developers/documentation/http/documentation#path-formats}
//   * for more information.
//   */
//   declare interface DropboxTypes$files$LookupErrorMalformedPath {
//     ".tag": "malformed_path";
//     malformed_path: DropboxTypes$files$MalformedPathError;
//   }

//   /**
//   * There is nothing at the given path.
//   */
//   declare interface DropboxTypes$files$LookupErrorNotFound {
//     ".tag": "not_found";
//   }

//   /**
//   * We were expecting a file, but the given path refers to something that
//   * isn't a file.
//   */
//   declare interface DropboxTypes$files$LookupErrorNotFile {
//     ".tag": "not_file";
//   }

//   /**
//   * We were expecting a folder, but the given path refers to something that
//   * isn't a folder.
//   */
//   declare interface DropboxTypes$files$LookupErrorNotFolder {
//     ".tag": "not_folder";
//   }

//   /**
//   * The file cannot be transferred because the content is restricted.  For
//   * example, sometimes there are legal restrictions due to copyright claims.
//   */
//   declare interface DropboxTypes$files$LookupErrorRestrictedContent {
//     ".tag": "restricted_content";
//   }

//   /**
//   * This operation is not supported for this content type.
//   */
//   declare interface DropboxTypes$files$LookupErrorUnsupportedContentType {
//     ".tag": "unsupported_content_type";
//   }

//   declare interface DropboxTypes$files$LookupErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$LookupError =
//     | DropboxTypes$files$LookupErrorMalformedPath
//     | DropboxTypes$files$LookupErrorNotFound
//     | DropboxTypes$files$LookupErrorNotFile
//     | DropboxTypes$files$LookupErrorNotFolder
//     | DropboxTypes$files$LookupErrorRestrictedContent
//     | DropboxTypes$files$LookupErrorUnsupportedContentType
//     | DropboxTypes$files$LookupErrorOther;

//   /**
//   * Indicate the photo/video is still under processing and metadata is not
//   * available yet.
//   */
//   declare interface DropboxTypes$files$MediaInfoPending {
//     ".tag": "pending";
//   }

//   /**
//   * The metadata for the photo/video.
//   */
//   declare interface DropboxTypes$files$MediaInfoMetadata {
//     ".tag": "metadata";
//     metadata:
//       | DropboxTypes$files$PhotoMetadataReference
//       | DropboxTypes$files$VideoMetadataReference;
//   }

//   declare type DropboxTypes$files$MediaInfo =
//     | DropboxTypes$files$MediaInfoPending
//     | DropboxTypes$files$MediaInfoMetadata;

//   /**
//   * Metadata for a photo or video.
//   */
//   declare interface DropboxTypes$files$MediaMetadata {
//     /**
//     * Dimension of the photo/video.
//     */
//     dimensions?: DropboxTypes$files$Dimensions;

//     /**
//     * The GPS coordinate of the photo/video.
//     */
//     location?: DropboxTypes$files$GpsCoordinates;

//     /**
//     * The timestamp when the photo/video is taken.
//     */
//     time_taken?: DropboxTypes$common$DropboxTimestamp;
//   }

//   /**
//   * Reference to the MediaMetadata polymorphic type. Contains a .tag property
//   * to let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$files$MediaMetadataReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "photo" | "video",
//     ...
//   } & DropboxTypes$files$MediaMetadata;

//   /**
//   * Metadata for a file or folder.
//   */
//   declare interface DropboxTypes$files$Metadata {
//     /**
//     * The last component of the path (including extension). This never
//     * contains a slash.
//     */
//     name: string;

//     /**
//     * The lowercased full path in the user's Dropbox. This always starts with
//     * a slash. This field will be null if the file or folder is not mounted.
//     */
//     path_lower?: string;

//     /**
//     * The cased path to be used for display purposes only. In rare instances
//     * the casing will not correctly match the user's filesystem, but this
//     * behavior will match the path provided in the Core API v1, and at least
//     * the last path component will have the correct casing. Changes to only
//     * the casing of paths won't be returned by listFolderContinue(). This
//     * field will be null if the file or folder is not mounted.
//     */
//     path_display?: string;

//     /**
//     * Please use FileSharingInfo.parent_shared_folder_id or
//     * FolderSharingInfo.parent_shared_folder_id instead.
//     */
//     parent_shared_folder_id?: DropboxTypes$common$SharedFolderId;
//   }

//   /**
//   * Reference to the Metadata polymorphic type. Contains a .tag property to
//   * let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$files$MetadataReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "file" | "folder" | "deleted",
//     ...
//   } & DropboxTypes$files$Metadata;

//   declare type DropboxTypes$files$MoveBatchArg = {
//     /**
//     * Defaults to False.
//     */
//     allow_ownership_transfer?: boolean,
//     ...
//   } & DropboxTypes$files$RelocationBatchArgBase;

//   /**
//   * Metadata for a photo.
//   */
//   declare type DropboxTypes$files$PhotoMetadata = {
//     ...
//   } & DropboxTypes$files$MediaMetadata;

//   /**
//   * Reference to the PhotoMetadata type, identified by the value of the .tag
//   * property.
//   */
//   declare type DropboxTypes$files$PhotoMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "photo",
//     ...
//   } & DropboxTypes$files$PhotoMetadata;

//   declare interface DropboxTypes$files$PreviewArg {
//     /**
//     * The path of the file to preview.
//     */
//     path: DropboxTypes$files$ReadPath;

//     /**
//     * Please specify revision in path instead.
//     */
//     rev?: DropboxTypes$files$Rev;
//   }

//   /**
//   * An error occurs when downloading metadata for the file.
//   */
//   declare interface DropboxTypes$files$PreviewErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * This preview generation is still in progress and the file is not ready
//   * for preview yet.
//   */
//   declare interface DropboxTypes$files$PreviewErrorInProgress {
//     ".tag": "in_progress";
//   }

//   /**
//   * The file extension is not supported preview generation.
//   */
//   declare interface DropboxTypes$files$PreviewErrorUnsupportedExtension {
//     ".tag": "unsupported_extension";
//   }

//   /**
//   * The file content is not supported for preview generation.
//   */
//   declare interface DropboxTypes$files$PreviewErrorUnsupportedContent {
//     ".tag": "unsupported_content";
//   }

//   declare type DropboxTypes$files$PreviewError =
//     | DropboxTypes$files$PreviewErrorPath
//     | DropboxTypes$files$PreviewErrorInProgress
//     | DropboxTypes$files$PreviewErrorUnsupportedExtension
//     | DropboxTypes$files$PreviewErrorUnsupportedContent;

//   declare type DropboxTypes$files$RelocationArg = {
//     /**
//     * Defaults to False.
//     */
//     allow_shared_folder?: boolean,

//     /**
//     * Defaults to False.
//     */
//     autorename?: boolean,

//     /**
//     * Defaults to False.
//     */
//     allow_ownership_transfer?: boolean,
//     ...
//   } & DropboxTypes$files$RelocationPath;

//   declare type DropboxTypes$files$RelocationBatchArg = {
//     /**
//     * Defaults to False.
//     */
//     allow_shared_folder?: boolean,

//     /**
//     * Defaults to False.
//     */
//     allow_ownership_transfer?: boolean,
//     ...
//   } & DropboxTypes$files$RelocationBatchArgBase;

//   declare interface DropboxTypes$files$RelocationBatchArgBase {
//     /**
//     * List of entries to be moved or copied. Each entry is
//     * files.RelocationPath.
//     */
//     entries: Array<DropboxTypes$files$RelocationPath>;

//     /**
//     * Defaults to False.
//     */
//     autorename?: boolean;
//   }

//   /**
//   * There are too many write operations in user's Dropbox. Please retry this
//   * request.
//   */
//   declare interface DropboxTypes$files$RelocationBatchErrorTooManyWriteOperations {
//     ".tag": "too_many_write_operations";
//   }

//   declare type DropboxTypes$files$RelocationBatchError =
//     | DropboxTypes$files$RelocationError
//     | DropboxTypes$files$RelocationBatchErrorTooManyWriteOperations;

//   /**
//   * User errors that retry won't help.
//   */
//   declare interface DropboxTypes$files$RelocationBatchErrorEntryRelocationError {
//     ".tag": "relocation_error";
//     relocation_error: DropboxTypes$files$RelocationError;
//   }

//   /**
//   * Something went wrong with the job on Dropbox's end. You'll need to verify
//   * that the action you were taking succeeded, and if not, try again. This
//   * should happen very rarely.
//   */
//   declare interface DropboxTypes$files$RelocationBatchErrorEntryInternalError {
//     ".tag": "internal_error";
//   }

//   /**
//   * There are too many write operations in user's Dropbox. Please retry this
//   * request.
//   */
//   declare interface DropboxTypes$files$RelocationBatchErrorEntryTooManyWriteOperations {
//     ".tag": "too_many_write_operations";
//   }

//   declare interface DropboxTypes$files$RelocationBatchErrorEntryOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$RelocationBatchErrorEntry =
//     | DropboxTypes$files$RelocationBatchErrorEntryRelocationError
//     | DropboxTypes$files$RelocationBatchErrorEntryInternalError
//     | DropboxTypes$files$RelocationBatchErrorEntryTooManyWriteOperations
//     | DropboxTypes$files$RelocationBatchErrorEntryOther;

//   /**
//   * The copy or move batch job has finished.
//   */
//   declare type DropboxTypes$files$RelocationBatchJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$RelocationBatchResult;

//   /**
//   * The copy or move batch job has failed with exception.
//   */
//   declare interface DropboxTypes$files$RelocationBatchJobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$files$RelocationBatchError;
//   }

//   declare type DropboxTypes$files$RelocationBatchJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$files$RelocationBatchJobStatusComplete
//     | DropboxTypes$files$RelocationBatchJobStatusFailed;

//   declare type DropboxTypes$files$RelocationBatchLaunchComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$RelocationBatchResult;

//   declare interface DropboxTypes$files$RelocationBatchLaunchOther {
//     ".tag": "other";
//   }

//   /**
//   * Result returned by copyBatch() or moveBatch() that may either launch an
//   * asynchronous job or complete synchronously.
//   */
//   declare type DropboxTypes$files$RelocationBatchLaunch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$files$RelocationBatchLaunchComplete
//     | DropboxTypes$files$RelocationBatchLaunchOther;

//   declare type DropboxTypes$files$RelocationBatchResult = {
//     entries: Array<DropboxTypes$files$RelocationBatchResultData>,
//     ...
//   } & DropboxTypes$files$FileOpsResult;

//   declare interface DropboxTypes$files$RelocationBatchResultData {
//     /**
//     * Metadata of the relocated object.
//     */
//     metadata:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference;
//   }

//   declare interface DropboxTypes$files$RelocationBatchResultEntrySuccess {
//     ".tag": "success";
//     success:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference;
//   }

//   declare interface DropboxTypes$files$RelocationBatchResultEntryFailure {
//     ".tag": "failure";
//     failure: DropboxTypes$files$RelocationBatchErrorEntry;
//   }

//   declare interface DropboxTypes$files$RelocationBatchResultEntryOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$RelocationBatchResultEntry =
//     | DropboxTypes$files$RelocationBatchResultEntrySuccess
//     | DropboxTypes$files$RelocationBatchResultEntryFailure
//     | DropboxTypes$files$RelocationBatchResultEntryOther;

//   /**
//   * The copy or move batch job has finished.
//   */
//   declare type DropboxTypes$files$RelocationBatchV2JobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$RelocationBatchV2Result;

//   /**
//   * Result returned by copyBatchCheckV2() or moveBatchCheckV2() that may
//   * either be in progress or completed with result for each entry.
//   */
//   declare type DropboxTypes$files$RelocationBatchV2JobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$files$RelocationBatchV2JobStatusComplete;

//   declare type DropboxTypes$files$RelocationBatchV2LaunchComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$RelocationBatchV2Result;

//   /**
//   * Result returned by copyBatchV2() or moveBatchV2() that may either launch
//   * an asynchronous job or complete synchronously.
//   */
//   declare type DropboxTypes$files$RelocationBatchV2Launch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$files$RelocationBatchV2LaunchComplete;

//   declare type DropboxTypes$files$RelocationBatchV2Result = {
//     /**
//     * Each entry in CopyBatchArg.entries or MoveBatchArg.entries will appear
//     * at the same position inside RelocationBatchV2Result.entries.
//     */
//     entries: Array<DropboxTypes$files$RelocationBatchResultEntry>,
//     ...
//   } & DropboxTypes$files$FileOpsResult;

//   declare interface DropboxTypes$files$RelocationErrorFromLookup {
//     ".tag": "from_lookup";
//     from_lookup: DropboxTypes$files$LookupError;
//   }

//   declare interface DropboxTypes$files$RelocationErrorFromWrite {
//     ".tag": "from_write";
//     from_write: DropboxTypes$files$WriteError;
//   }

//   declare interface DropboxTypes$files$RelocationErrorTo {
//     ".tag": "to";
//     to: DropboxTypes$files$WriteError;
//   }

//   /**
//   * Shared folders can't be copied.
//   */
//   declare interface DropboxTypes$files$RelocationErrorCantCopySharedFolder {
//     ".tag": "cant_copy_shared_folder";
//   }

//   /**
//   * Your move operation would result in nested shared folders.  This is not
//   * allowed.
//   */
//   declare interface DropboxTypes$files$RelocationErrorCantNestSharedFolder {
//     ".tag": "cant_nest_shared_folder";
//   }

//   /**
//   * You cannot move a folder into itself.
//   */
//   declare interface DropboxTypes$files$RelocationErrorCantMoveFolderIntoItself {
//     ".tag": "cant_move_folder_into_itself";
//   }

//   /**
//   * The operation would involve more than 10,000 files and folders.
//   */
//   declare interface DropboxTypes$files$RelocationErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   /**
//   * There are duplicated/nested paths among RelocationArg.from_path and
//   * RelocationArg.to_path.
//   */
//   declare interface DropboxTypes$files$RelocationErrorDuplicatedOrNestedPaths {
//     ".tag": "duplicated_or_nested_paths";
//   }

//   /**
//   * Your move operation would result in an ownership transfer. You may
//   * reissue the request with the field RelocationArg.allow_ownership_transfer
//   * to true.
//   */
//   declare interface DropboxTypes$files$RelocationErrorCantTransferOwnership {
//     ".tag": "cant_transfer_ownership";
//   }

//   /**
//   * The current user does not have enough space to move or copy the files.
//   */
//   declare interface DropboxTypes$files$RelocationErrorInsufficientQuota {
//     ".tag": "insufficient_quota";
//   }

//   /**
//   * Something went wrong with the job on Dropbox's end. You'll need to verify
//   * that the action you were taking succeeded, and if not, try again. This
//   * should happen very rarely.
//   */
//   declare interface DropboxTypes$files$RelocationErrorInternalError {
//     ".tag": "internal_error";
//   }

//   /**
//   * Can't move the shared folder to the given destination.
//   */
//   declare interface DropboxTypes$files$RelocationErrorCantMoveSharedFolder {
//     ".tag": "cant_move_shared_folder";
//   }

//   declare interface DropboxTypes$files$RelocationErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$RelocationError =
//     | DropboxTypes$files$RelocationErrorFromLookup
//     | DropboxTypes$files$RelocationErrorFromWrite
//     | DropboxTypes$files$RelocationErrorTo
//     | DropboxTypes$files$RelocationErrorCantCopySharedFolder
//     | DropboxTypes$files$RelocationErrorCantNestSharedFolder
//     | DropboxTypes$files$RelocationErrorCantMoveFolderIntoItself
//     | DropboxTypes$files$RelocationErrorTooManyFiles
//     | DropboxTypes$files$RelocationErrorDuplicatedOrNestedPaths
//     | DropboxTypes$files$RelocationErrorCantTransferOwnership
//     | DropboxTypes$files$RelocationErrorInsufficientQuota
//     | DropboxTypes$files$RelocationErrorInternalError
//     | DropboxTypes$files$RelocationErrorCantMoveSharedFolder
//     | DropboxTypes$files$RelocationErrorOther;

//   declare interface DropboxTypes$files$RelocationPath {
//     /**
//     * Path in the user's Dropbox to be copied or moved.
//     */
//     from_path: DropboxTypes$files$WritePathOrId;

//     /**
//     * Path in the user's Dropbox that is the destination.
//     */
//     to_path: DropboxTypes$files$WritePathOrId;
//   }

//   declare type DropboxTypes$files$RelocationResult = {
//     /**
//     * Metadata of the relocated object.
//     */
//     metadata:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference,
//     ...
//   } & DropboxTypes$files$FileOpsResult;

//   declare interface DropboxTypes$files$RestoreArg {
//     /**
//     * The path to save the restored file.
//     */
//     path: DropboxTypes$files$WritePath;

//     /**
//     * The revision to restore.
//     */
//     rev: DropboxTypes$files$Rev;
//   }

//   /**
//   * An error occurs when downloading metadata for the file.
//   */
//   declare interface DropboxTypes$files$RestoreErrorPathLookup {
//     ".tag": "path_lookup";
//     path_lookup: DropboxTypes$files$LookupError;
//   }

//   /**
//   * An error occurs when trying to restore the file to that path.
//   */
//   declare interface DropboxTypes$files$RestoreErrorPathWrite {
//     ".tag": "path_write";
//     path_write: DropboxTypes$files$WriteError;
//   }

//   /**
//   * The revision is invalid. It may not exist.
//   */
//   declare interface DropboxTypes$files$RestoreErrorInvalidRevision {
//     ".tag": "invalid_revision";
//   }

//   declare interface DropboxTypes$files$RestoreErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$RestoreError =
//     | DropboxTypes$files$RestoreErrorPathLookup
//     | DropboxTypes$files$RestoreErrorPathWrite
//     | DropboxTypes$files$RestoreErrorInvalidRevision
//     | DropboxTypes$files$RestoreErrorOther;

//   declare interface DropboxTypes$files$SaveCopyReferenceArg {
//     /**
//     * A copy reference returned by copyReferenceGet().
//     */
//     copy_reference: string;

//     /**
//     * Path in the user's Dropbox that is the destination.
//     */
//     path: DropboxTypes$files$Path;
//   }

//   declare interface DropboxTypes$files$SaveCopyReferenceErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$WriteError;
//   }

//   /**
//   * The copy reference is invalid.
//   */
//   declare interface DropboxTypes$files$SaveCopyReferenceErrorInvalidCopyReference {
//     ".tag": "invalid_copy_reference";
//   }

//   /**
//   * You don't have permission to save the given copy reference. Please make
//   * sure this app is same app which created the copy reference and the source
//   * user is still linked to the app.
//   */
//   declare interface DropboxTypes$files$SaveCopyReferenceErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * The file referenced by the copy reference cannot be found.
//   */
//   declare interface DropboxTypes$files$SaveCopyReferenceErrorNotFound {
//     ".tag": "not_found";
//   }

//   /**
//   * The operation would involve more than 10,000 files and folders.
//   */
//   declare interface DropboxTypes$files$SaveCopyReferenceErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   declare interface DropboxTypes$files$SaveCopyReferenceErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$SaveCopyReferenceError =
//     | DropboxTypes$files$SaveCopyReferenceErrorPath
//     | DropboxTypes$files$SaveCopyReferenceErrorInvalidCopyReference
//     | DropboxTypes$files$SaveCopyReferenceErrorNoPermission
//     | DropboxTypes$files$SaveCopyReferenceErrorNotFound
//     | DropboxTypes$files$SaveCopyReferenceErrorTooManyFiles
//     | DropboxTypes$files$SaveCopyReferenceErrorOther;

//   declare interface DropboxTypes$files$SaveCopyReferenceResult {
//     /**
//     * The metadata of the saved file or folder in the user's Dropbox.
//     */
//     metadata:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference;
//   }

//   declare interface DropboxTypes$files$SaveUrlArg {
//     /**
//     * The path in Dropbox where the URL will be saved to.
//     */
//     path: DropboxTypes$files$Path;

//     /**
//     * The URL to be saved.
//     */
//     url: string;
//   }

//   declare interface DropboxTypes$files$SaveUrlErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$WriteError;
//   }

//   /**
//   * Failed downloading the given URL. The url may be password-protected / the
//   * password provided was incorrect.
//   */
//   declare interface DropboxTypes$files$SaveUrlErrorDownloadFailed {
//     ".tag": "download_failed";
//   }

//   /**
//   * The given URL is invalid.
//   */
//   declare interface DropboxTypes$files$SaveUrlErrorInvalidUrl {
//     ".tag": "invalid_url";
//   }

//   /**
//   * The file where the URL is saved to no longer exists.
//   */
//   declare interface DropboxTypes$files$SaveUrlErrorNotFound {
//     ".tag": "not_found";
//   }

//   declare interface DropboxTypes$files$SaveUrlErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$SaveUrlError =
//     | DropboxTypes$files$SaveUrlErrorPath
//     | DropboxTypes$files$SaveUrlErrorDownloadFailed
//     | DropboxTypes$files$SaveUrlErrorInvalidUrl
//     | DropboxTypes$files$SaveUrlErrorNotFound
//     | DropboxTypes$files$SaveUrlErrorOther;

//   /**
//   * Metadata of the file where the URL is saved to.
//   */
//   declare type DropboxTypes$files$SaveUrlJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$FileMetadata;

//   declare interface DropboxTypes$files$SaveUrlJobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$files$SaveUrlError;
//   }

//   declare type DropboxTypes$files$SaveUrlJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$files$SaveUrlJobStatusComplete
//     | DropboxTypes$files$SaveUrlJobStatusFailed;

//   /**
//   * Metadata of the file where the URL is saved to.
//   */
//   declare type DropboxTypes$files$SaveUrlResultComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$FileMetadata;

//   declare type DropboxTypes$files$SaveUrlResult =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$files$SaveUrlResultComplete;

//   declare interface DropboxTypes$files$SearchArg {
//     /**
//     * The path in the user's Dropbox to search. Should probably be a folder.
//     */
//     path: DropboxTypes$files$PathROrId;

//     /**
//     * The string to search for. The search string is split on spaces into
//     * multiple tokens. For file name searching, the last token is used for
//     * prefix matching (i.e. "bat c" matches "bat cave" but not "batman car").
//     */
//     query: string;

//     /**
//     * Defaults to 0.
//     */
//     start?: number;

//     /**
//     * Defaults to 100.
//     */
//     max_results?: number;

//     /**
//     * Defaults to TagRef(Union(u'SearchMode', [UnionField(u'filename', Void,
//     * False, None), UnionField(u'filename_and_content', Void, False, None),
//     * UnionField(u'deleted_filename', Void, False, None)]), u'filename').
//     */
//     mode?: DropboxTypes$files$SearchMode;
//   }

//   declare interface DropboxTypes$files$SearchErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   declare interface DropboxTypes$files$SearchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$SearchError =
//     | DropboxTypes$files$SearchErrorPath
//     | DropboxTypes$files$SearchErrorOther;

//   declare interface DropboxTypes$files$SearchMatch {
//     /**
//     * The type of the match.
//     */
//     match_type: DropboxTypes$files$SearchMatchType;

//     /**
//     * The metadata for the matched file or folder.
//     */
//     metadata:
//       | DropboxTypes$files$FileMetadataReference
//       | DropboxTypes$files$FolderMetadataReference
//       | DropboxTypes$files$DeletedMetadataReference;
//   }

//   /**
//   * This item was matched on its file or folder name.
//   */
//   declare interface DropboxTypes$files$SearchMatchTypeFilename {
//     ".tag": "filename";
//   }

//   /**
//   * This item was matched based on its file contents.
//   */
//   declare interface DropboxTypes$files$SearchMatchTypeContent {
//     ".tag": "content";
//   }

//   /**
//   * This item was matched based on both its contents and its file name.
//   */
//   declare interface DropboxTypes$files$SearchMatchTypeBoth {
//     ".tag": "both";
//   }

//   /**
//   * Indicates what type of match was found for a given item.
//   */
//   declare type DropboxTypes$files$SearchMatchType =
//     | DropboxTypes$files$SearchMatchTypeFilename
//     | DropboxTypes$files$SearchMatchTypeContent
//     | DropboxTypes$files$SearchMatchTypeBoth;

//   /**
//   * Search file and folder names.
//   */
//   declare interface DropboxTypes$files$SearchModeFilename {
//     ".tag": "filename";
//   }

//   /**
//   * Search file and folder names as well as file contents.
//   */
//   declare interface DropboxTypes$files$SearchModeFilenameAndContent {
//     ".tag": "filename_and_content";
//   }

//   /**
//   * Search for deleted file and folder names.
//   */
//   declare interface DropboxTypes$files$SearchModeDeletedFilename {
//     ".tag": "deleted_filename";
//   }

//   declare type DropboxTypes$files$SearchMode =
//     | DropboxTypes$files$SearchModeFilename
//     | DropboxTypes$files$SearchModeFilenameAndContent
//     | DropboxTypes$files$SearchModeDeletedFilename;

//   declare interface DropboxTypes$files$SearchResult {
//     /**
//     * A list (possibly empty) of matches for the query.
//     */
//     matches: Array<DropboxTypes$files$SearchMatch>;

//     /**
//     * Used for paging. If true, indicates there is another page of results
//     * available that can be fetched by calling search() again.
//     */
//     more: boolean;

//     /**
//     * Used for paging. Value to set the start argument to when calling
//     * search() to fetch the next page of results.
//     */
//     start: number;
//   }

//   declare interface DropboxTypes$files$SharedLink {
//     /**
//     * Shared link url.
//     */
//     url: DropboxTypes$files$SharedLinkUrl;

//     /**
//     * Password for the shared link.
//     */
//     password?: string;
//   }

//   /**
//   * Sharing info for a file or folder.
//   */
//   declare interface DropboxTypes$files$SharingInfo {
//     /**
//     * True if the file or folder is inside a read-only shared folder.
//     */
//     read_only: boolean;
//   }

//   declare interface DropboxTypes$files$SymlinkInfo {
//     /**
//     * The target this symlink points to.
//     */
//     target: string;
//   }

//   /**
//   * On first sync to members' computers, the specified folder will follow its
//   * parent folder's setting or otherwise follow default sync behavior.
//   */
//   declare interface DropboxTypes$files$SyncSettingDefault {
//     ".tag": "default";
//   }

//   /**
//   * On first sync to members' computers, the specified folder will be set to
//   * not sync with selective sync.
//   */
//   declare interface DropboxTypes$files$SyncSettingNotSynced {
//     ".tag": "not_synced";
//   }

//   /**
//   * The specified folder's not_synced setting is inactive due to its location
//   * or other configuration changes. It will follow its parent folder's
//   * setting.
//   */
//   declare interface DropboxTypes$files$SyncSettingNotSyncedInactive {
//     ".tag": "not_synced_inactive";
//   }

//   declare interface DropboxTypes$files$SyncSettingOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$SyncSetting =
//     | DropboxTypes$files$SyncSettingDefault
//     | DropboxTypes$files$SyncSettingNotSynced
//     | DropboxTypes$files$SyncSettingNotSyncedInactive
//     | DropboxTypes$files$SyncSettingOther;

//   /**
//   * On first sync to members' computers, the specified folder will follow its
//   * parent folder's setting or otherwise follow default sync behavior.
//   */
//   declare interface DropboxTypes$files$SyncSettingArgDefault {
//     ".tag": "default";
//   }

//   /**
//   * On first sync to members' computers, the specified folder will be set to
//   * not sync with selective sync.
//   */
//   declare interface DropboxTypes$files$SyncSettingArgNotSynced {
//     ".tag": "not_synced";
//   }

//   declare interface DropboxTypes$files$SyncSettingArgOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$SyncSettingArg =
//     | DropboxTypes$files$SyncSettingArgDefault
//     | DropboxTypes$files$SyncSettingArgNotSynced
//     | DropboxTypes$files$SyncSettingArgOther;

//   declare interface DropboxTypes$files$SyncSettingsErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * Setting this combination of sync settings simultaneously is not
//   * supported.
//   */
//   declare interface DropboxTypes$files$SyncSettingsErrorUnsupportedCombination {
//     ".tag": "unsupported_combination";
//   }

//   /**
//   * The specified configuration is not supported.
//   */
//   declare interface DropboxTypes$files$SyncSettingsErrorUnsupportedConfiguration {
//     ".tag": "unsupported_configuration";
//   }

//   declare interface DropboxTypes$files$SyncSettingsErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$SyncSettingsError =
//     | DropboxTypes$files$SyncSettingsErrorPath
//     | DropboxTypes$files$SyncSettingsErrorUnsupportedCombination
//     | DropboxTypes$files$SyncSettingsErrorUnsupportedConfiguration
//     | DropboxTypes$files$SyncSettingsErrorOther;

//   declare interface DropboxTypes$files$ThumbnailArg {
//     /**
//     * The path to the image file you want to thumbnail.
//     */
//     path: DropboxTypes$files$ReadPath;

//     /**
//     * Defaults to TagRef(Union(u'ThumbnailFormat', [UnionField(u'jpeg', Void,
//     * False, None), UnionField(u'png', Void, False, None)]), u'jpeg').
//     */
//     format?: DropboxTypes$files$ThumbnailFormat;

//     /**
//     * Defaults to TagRef(Union(u'ThumbnailSize', [UnionField(u'w32h32', Void,
//     * False, None), UnionField(u'w64h64', Void, False, None),
//     * UnionField(u'w128h128', Void, False, None), UnionField(u'w256h256',
//     * Void, False, None), UnionField(u'w480h320', Void, False, None),
//     * UnionField(u'w640h480', Void, False, None), UnionField(u'w960h640',
//     * Void, False, None), UnionField(u'w1024h768', Void, False, None),
//     * UnionField(u'w2048h1536', Void, False, None)]), u'w64h64').
//     */
//     size?: DropboxTypes$files$ThumbnailSize;

//     /**
//     * Defaults to TagRef(Union(u'ThumbnailMode', [UnionField(u'strict', Void,
//     * False, None), UnionField(u'bestfit', Void, False, None),
//     * UnionField(u'fitone_bestfit', Void, False, None)]), u'strict').
//     */
//     mode?: DropboxTypes$files$ThumbnailMode;
//   }

//   /**
//   * An error occurs when downloading metadata for the image.
//   */
//   declare interface DropboxTypes$files$ThumbnailErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * The file extension doesn't allow conversion to a thumbnail.
//   */
//   declare interface DropboxTypes$files$ThumbnailErrorUnsupportedExtension {
//     ".tag": "unsupported_extension";
//   }

//   /**
//   * The image cannot be converted to a thumbnail.
//   */
//   declare interface DropboxTypes$files$ThumbnailErrorUnsupportedImage {
//     ".tag": "unsupported_image";
//   }

//   /**
//   * An error occurs during thumbnail conversion.
//   */
//   declare interface DropboxTypes$files$ThumbnailErrorConversionError {
//     ".tag": "conversion_error";
//   }

//   declare type DropboxTypes$files$ThumbnailError =
//     | DropboxTypes$files$ThumbnailErrorPath
//     | DropboxTypes$files$ThumbnailErrorUnsupportedExtension
//     | DropboxTypes$files$ThumbnailErrorUnsupportedImage
//     | DropboxTypes$files$ThumbnailErrorConversionError;

//   declare interface DropboxTypes$files$ThumbnailFormatJpeg {
//     ".tag": "jpeg";
//   }

//   declare interface DropboxTypes$files$ThumbnailFormatPng {
//     ".tag": "png";
//   }

//   declare type DropboxTypes$files$ThumbnailFormat =
//     | DropboxTypes$files$ThumbnailFormatJpeg
//     | DropboxTypes$files$ThumbnailFormatPng;

//   /**
//   * Scale down the image to fit within the given size.
//   */
//   declare interface DropboxTypes$files$ThumbnailModeStrict {
//     ".tag": "strict";
//   }

//   /**
//   * Scale down the image to fit within the given size or its transpose.
//   */
//   declare interface DropboxTypes$files$ThumbnailModeBestfit {
//     ".tag": "bestfit";
//   }

//   /**
//   * Scale down the image to completely cover the given size or its transpose.
//   */
//   declare interface DropboxTypes$files$ThumbnailModeFitoneBestfit {
//     ".tag": "fitone_bestfit";
//   }

//   declare type DropboxTypes$files$ThumbnailMode =
//     | DropboxTypes$files$ThumbnailModeStrict
//     | DropboxTypes$files$ThumbnailModeBestfit
//     | DropboxTypes$files$ThumbnailModeFitoneBestfit;

//   /**
//   * 32 by 32 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW32h32 {
//     ".tag": "w32h32";
//   }

//   /**
//   * 64 by 64 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW64h64 {
//     ".tag": "w64h64";
//   }

//   /**
//   * 128 by 128 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW128h128 {
//     ".tag": "w128h128";
//   }

//   /**
//   * 256 by 256 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW256h256 {
//     ".tag": "w256h256";
//   }

//   /**
//   * 480 by 320 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW480h320 {
//     ".tag": "w480h320";
//   }

//   /**
//   * 640 by 480 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW640h480 {
//     ".tag": "w640h480";
//   }

//   /**
//   * 960 by 640 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW960h640 {
//     ".tag": "w960h640";
//   }

//   /**
//   * 1024 by 768 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW1024h768 {
//     ".tag": "w1024h768";
//   }

//   /**
//   * 2048 by 1536 px.
//   */
//   declare interface DropboxTypes$files$ThumbnailSizeW2048h1536 {
//     ".tag": "w2048h1536";
//   }

//   declare type DropboxTypes$files$ThumbnailSize =
//     | DropboxTypes$files$ThumbnailSizeW32h32
//     | DropboxTypes$files$ThumbnailSizeW64h64
//     | DropboxTypes$files$ThumbnailSizeW128h128
//     | DropboxTypes$files$ThumbnailSizeW256h256
//     | DropboxTypes$files$ThumbnailSizeW480h320
//     | DropboxTypes$files$ThumbnailSizeW640h480
//     | DropboxTypes$files$ThumbnailSizeW960h640
//     | DropboxTypes$files$ThumbnailSizeW1024h768
//     | DropboxTypes$files$ThumbnailSizeW2048h1536;

//   /**
//   * Unable to save the uploaded contents to a file.
//   */
//   declare type DropboxTypes$files$UploadErrorPath = {
//     ".tag": "path",
//     ...
//   } & DropboxTypes$files$UploadWriteFailed;

//   /**
//   * The supplied property group is invalid. The file has uploaded without
//   * property groups.
//   */
//   declare interface DropboxTypes$files$UploadErrorPropertiesError {
//     ".tag": "properties_error";
//     properties_error: DropboxTypes$file_properties$InvalidPropertyGroupError;
//   }

//   declare interface DropboxTypes$files$UploadErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$UploadError =
//     | DropboxTypes$files$UploadErrorPath
//     | DropboxTypes$files$UploadErrorPropertiesError
//     | DropboxTypes$files$UploadErrorOther;

//   declare type DropboxTypes$files$UploadErrorWithProperties = DropboxTypes$files$UploadError;

//   declare interface DropboxTypes$files$UploadSessionAppendArg {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object;

//     /**
//     * Contains the upload session ID and the offset.
//     */
//     cursor: DropboxTypes$files$UploadSessionCursor;

//     /**
//     * Defaults to False.
//     */
//     close?: boolean;
//   }

//   declare interface DropboxTypes$files$UploadSessionCursor {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object;

//     /**
//     * The upload session ID (returned by uploadSessionStart()).
//     */
//     session_id: string;

//     /**
//     * The amount of data that has been uploaded so far. We use this to make
//     * sure upload data isn't lost or duplicated in the event of a network
//     * error.
//     */
//     offset: number;
//   }

//   declare interface DropboxTypes$files$UploadSessionFinishArg {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object;

//     /**
//     * Contains the upload session ID and the offset.
//     */
//     cursor: DropboxTypes$files$UploadSessionCursor;

//     /**
//     * Contains the path and other optional modifiers for the commit.
//     */
//     commit: DropboxTypes$files$CommitInfo;
//   }

//   declare interface DropboxTypes$files$UploadSessionFinishBatchArg {
//     /**
//     * Commit information for each file in the batch.
//     */
//     entries: Array<DropboxTypes$files$UploadSessionFinishArg>;
//   }

//   /**
//   * The uploadSessionFinishBatch() has finished.
//   */
//   declare type DropboxTypes$files$UploadSessionFinishBatchJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$UploadSessionFinishBatchResult;

//   declare type DropboxTypes$files$UploadSessionFinishBatchJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$files$UploadSessionFinishBatchJobStatusComplete;

//   declare type DropboxTypes$files$UploadSessionFinishBatchLaunchComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$files$UploadSessionFinishBatchResult;

//   declare interface DropboxTypes$files$UploadSessionFinishBatchLaunchOther {
//     ".tag": "other";
//   }

//   /**
//   * Result returned by uploadSessionFinishBatch() that may either launch an
//   * asynchronous job or complete synchronously.
//   */
//   declare type DropboxTypes$files$UploadSessionFinishBatchLaunch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$files$UploadSessionFinishBatchLaunchComplete
//     | DropboxTypes$files$UploadSessionFinishBatchLaunchOther;

//   declare interface DropboxTypes$files$UploadSessionFinishBatchResult {
//     /**
//     * Each entry in UploadSessionFinishBatchArg.entries will appear at the
//     * same position inside UploadSessionFinishBatchResult.entries.
//     */
//     entries: Array<DropboxTypes$files$UploadSessionFinishBatchResultEntry>;
//   }

//   declare type DropboxTypes$files$UploadSessionFinishBatchResultEntrySuccess = {
//     ".tag": "success",
//     ...
//   } & DropboxTypes$files$FileMetadata;

//   declare interface DropboxTypes$files$UploadSessionFinishBatchResultEntryFailure {
//     ".tag": "failure";
//     failure: DropboxTypes$files$UploadSessionFinishError;
//   }

//   declare type DropboxTypes$files$UploadSessionFinishBatchResultEntry =
//     | DropboxTypes$files$UploadSessionFinishBatchResultEntrySuccess
//     | DropboxTypes$files$UploadSessionFinishBatchResultEntryFailure;

//   /**
//   * The session arguments are incorrect; the value explains the reason.
//   */
//   declare interface DropboxTypes$files$UploadSessionFinishErrorLookupFailed {
//     ".tag": "lookup_failed";
//     lookup_failed: DropboxTypes$files$UploadSessionLookupError;
//   }

//   /**
//   * Unable to save the uploaded contents to a file. Data has already been
//   * appended to the upload session. Please retry with empty data body and
//   * updated offset.
//   */
//   declare interface DropboxTypes$files$UploadSessionFinishErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$WriteError;
//   }

//   /**
//   * The supplied property group is invalid. The file has uploaded without
//   * property groups.
//   */
//   declare interface DropboxTypes$files$UploadSessionFinishErrorPropertiesError {
//     ".tag": "properties_error";
//     properties_error: DropboxTypes$file_properties$InvalidPropertyGroupError;
//   }

//   /**
//   * The batch request commits files into too many different shared folders.
//   * Please limit your batch request to files contained in a single shared
//   * folder.
//   */
//   declare interface DropboxTypes$files$UploadSessionFinishErrorTooManySharedFolderTargets {
//     ".tag": "too_many_shared_folder_targets";
//   }

//   /**
//   * There are too many write operations happening in the user's Dropbox. You
//   * should retry uploading this file.
//   */
//   declare interface DropboxTypes$files$UploadSessionFinishErrorTooManyWriteOperations {
//     ".tag": "too_many_write_operations";
//   }

//   declare interface DropboxTypes$files$UploadSessionFinishErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$UploadSessionFinishError =
//     | DropboxTypes$files$UploadSessionFinishErrorLookupFailed
//     | DropboxTypes$files$UploadSessionFinishErrorPath
//     | DropboxTypes$files$UploadSessionFinishErrorPropertiesError
//     | DropboxTypes$files$UploadSessionFinishErrorTooManySharedFolderTargets
//     | DropboxTypes$files$UploadSessionFinishErrorTooManyWriteOperations
//     | DropboxTypes$files$UploadSessionFinishErrorOther;

//   /**
//   * The upload session ID was not found or has expired. Upload sessions are
//   * valid for 48 hours.
//   */
//   declare interface DropboxTypes$files$UploadSessionLookupErrorNotFound {
//     ".tag": "not_found";
//   }

//   /**
//   * The specified offset was incorrect. See the value for the correct offset.
//   * This error may occur when a previous request was received and processed
//   * successfully but the client did not receive the response, e.g. due to a
//   * network error.
//   */
//   declare type DropboxTypes$files$UploadSessionLookupErrorIncorrectOffset = {
//     ".tag": "incorrect_offset",
//     ...
//   } & DropboxTypes$files$UploadSessionOffsetError;

//   /**
//   * You are attempting to append data to an upload session that has already
//   * been closed (i.e. committed).
//   */
//   declare interface DropboxTypes$files$UploadSessionLookupErrorClosed {
//     ".tag": "closed";
//   }

//   /**
//   * The session must be closed before calling upload_session/finish_batch.
//   */
//   declare interface DropboxTypes$files$UploadSessionLookupErrorNotClosed {
//     ".tag": "not_closed";
//   }

//   /**
//   * You can not append to the upload session because the size of a file
//   * should not reach the max file size limit (i.e. 350GB).
//   */
//   declare interface DropboxTypes$files$UploadSessionLookupErrorTooLarge {
//     ".tag": "too_large";
//   }

//   declare interface DropboxTypes$files$UploadSessionLookupErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$UploadSessionLookupError =
//     | DropboxTypes$files$UploadSessionLookupErrorNotFound
//     | DropboxTypes$files$UploadSessionLookupErrorIncorrectOffset
//     | DropboxTypes$files$UploadSessionLookupErrorClosed
//     | DropboxTypes$files$UploadSessionLookupErrorNotClosed
//     | DropboxTypes$files$UploadSessionLookupErrorTooLarge
//     | DropboxTypes$files$UploadSessionLookupErrorOther;

//   declare interface DropboxTypes$files$UploadSessionOffsetError {
//     /**
//     * The offset up to which data has been collected.
//     */
//     correct_offset: number;
//   }

//   declare interface DropboxTypes$files$UploadSessionStartArg {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object;

//     /**
//     * Defaults to False.
//     */
//     close?: boolean;
//   }

//   declare interface DropboxTypes$files$UploadSessionStartResult {
//     /**
//     * A unique identifier for the upload session. Pass this to
//     * uploadSessionAppendV2() and uploadSessionFinish().
//     */
//     session_id: string;
//   }

//   declare interface DropboxTypes$files$UploadWriteFailed {
//     /**
//     * The reason why the file couldn't be saved.
//     */
//     reason: DropboxTypes$files$WriteError;

//     /**
//     * The upload session ID; data has already been uploaded to the
//     * corresponding upload session and this ID may be used to retry the
//     * commit with uploadSessionFinish().
//     */
//     upload_session_id: string;
//   }

//   /**
//   * Metadata for a video.
//   */
//   declare type DropboxTypes$files$VideoMetadata = {
//     /**
//     * The duration of the video in milliseconds.
//     */
//     duration?: number,
//     ...
//   } & DropboxTypes$files$MediaMetadata;

//   /**
//   * Reference to the VideoMetadata type, identified by the value of the .tag
//   * property.
//   */
//   declare type DropboxTypes$files$VideoMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "video",
//     ...
//   } & DropboxTypes$files$VideoMetadata;

//   /**
//   * There's a file in the way.
//   */
//   declare interface DropboxTypes$files$WriteConflictErrorFile {
//     ".tag": "file";
//   }

//   /**
//   * There's a folder in the way.
//   */
//   declare interface DropboxTypes$files$WriteConflictErrorFolder {
//     ".tag": "folder";
//   }

//   /**
//   * There's a file at an ancestor path, so we couldn't create the required
//   * parent folders.
//   */
//   declare interface DropboxTypes$files$WriteConflictErrorFileAncestor {
//     ".tag": "file_ancestor";
//   }

//   declare interface DropboxTypes$files$WriteConflictErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$WriteConflictError =
//     | DropboxTypes$files$WriteConflictErrorFile
//     | DropboxTypes$files$WriteConflictErrorFolder
//     | DropboxTypes$files$WriteConflictErrorFileAncestor
//     | DropboxTypes$files$WriteConflictErrorOther;

//   /**
//   * The given path does not satisfy the required path format. Please refer to
//   * the [Path formats documentation]{@link
//   * https://www.dropbox.com/developers/documentation/http/documentation#path-formats}
//   * for more information.
//   */
//   declare interface DropboxTypes$files$WriteErrorMalformedPath {
//     ".tag": "malformed_path";
//     malformed_path: DropboxTypes$files$MalformedPathError;
//   }

//   /**
//   * Couldn't write to the target path because there was something in the way.
//   */
//   declare interface DropboxTypes$files$WriteErrorConflict {
//     ".tag": "conflict";
//     conflict: DropboxTypes$files$WriteConflictError;
//   }

//   /**
//   * The user doesn't have permissions to write to the target location.
//   */
//   declare interface DropboxTypes$files$WriteErrorNoWritePermission {
//     ".tag": "no_write_permission";
//   }

//   /**
//   * The user doesn't have enough available space (bytes) to write more data.
//   */
//   declare interface DropboxTypes$files$WriteErrorInsufficientSpace {
//     ".tag": "insufficient_space";
//   }

//   /**
//   * Dropbox will not save the file or folder because of its name.
//   */
//   declare interface DropboxTypes$files$WriteErrorDisallowedName {
//     ".tag": "disallowed_name";
//   }

//   /**
//   * This endpoint cannot move or delete team folders.
//   */
//   declare interface DropboxTypes$files$WriteErrorTeamFolder {
//     ".tag": "team_folder";
//   }

//   /**
//   * There are too many write operations in user's Dropbox. Please retry this
//   * request.
//   */
//   declare interface DropboxTypes$files$WriteErrorTooManyWriteOperations {
//     ".tag": "too_many_write_operations";
//   }

//   declare interface DropboxTypes$files$WriteErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$files$WriteError =
//     | DropboxTypes$files$WriteErrorMalformedPath
//     | DropboxTypes$files$WriteErrorConflict
//     | DropboxTypes$files$WriteErrorNoWritePermission
//     | DropboxTypes$files$WriteErrorInsufficientSpace
//     | DropboxTypes$files$WriteErrorDisallowedName
//     | DropboxTypes$files$WriteErrorTeamFolder
//     | DropboxTypes$files$WriteErrorTooManyWriteOperations
//     | DropboxTypes$files$WriteErrorOther;

//   /**
//   * Do not overwrite an existing file if there is a conflict. The autorename
//   * strategy is to append a number to the file name. For example,
//   * "document.txt" might become "document (2).txt".
//   */
//   declare interface DropboxTypes$files$WriteModeAdd {
//     ".tag": "add";
//   }

//   /**
//   * Always overwrite the existing file. The autorename strategy is the same
//   * as it is for add.
//   */
//   declare interface DropboxTypes$files$WriteModeOverwrite {
//     ".tag": "overwrite";
//   }

//   /**
//   * Overwrite if the given "rev" matches the existing file's "rev". The
//   * autorename strategy is to append the string "conflicted copy" to the file
//   * name. For example, "document.txt" might become "document (conflicted
//   * copy).txt" or "document (Panda's conflicted copy).txt".
//   */
//   declare interface DropboxTypes$files$WriteModeUpdate {
//     ".tag": "update";
//     update: DropboxTypes$files$Rev;
//   }

//   /**
//   * Your intent when writing a file to some path. This is used to determine
//   * what constitutes a conflict and what the autorename strategy is. In some
//   * situations, the conflict behavior is identical: (a) If the target path
//   * doesn't refer to anything, the file is always written; no conflict. (b)
//   * If the target path refers to a folder, it's always a conflict. (c) If the
//   * target path refers to a file with identical contents, nothing gets
//   * written; no conflict. The conflict checking differs in the case where
//   * there's a file at the target path with contents different from the
//   * contents you're trying to write.
//   */
//   declare type DropboxTypes$files$WriteMode =
//     | DropboxTypes$files$WriteModeAdd
//     | DropboxTypes$files$WriteModeOverwrite
//     | DropboxTypes$files$WriteModeUpdate;

//   declare type DropboxTypes$files$CopyBatchArg = DropboxTypes$files$RelocationBatchArgBase;

//   declare type DropboxTypes$files$FileId = string;

//   declare type DropboxTypes$files$Id = string;

//   declare type DropboxTypes$files$ListFolderCursor = string;

//   declare type DropboxTypes$files$MalformedPathError = Object;

//   declare type DropboxTypes$files$Path = string;

//   declare type DropboxTypes$files$PathOrId = string;

//   declare type DropboxTypes$files$PathR = string;

//   declare type DropboxTypes$files$PathROrId = string;

//   declare type DropboxTypes$files$ReadPath = string;

//   declare type DropboxTypes$files$Rev = string;

//   declare type DropboxTypes$files$Sha256HexHash = string;

//   declare type DropboxTypes$files$SharedLinkUrl = string;

//   declare type DropboxTypes$files$WritePath = string;

//   declare type DropboxTypes$files$WritePathOrId = string;

//   declare interface DropboxTypes$paper$AddMember {
//     /**
//     * Defaults to TagRef(Union(u'PaperDocPermissionLevel',
//     * [UnionField(u'edit', Void, False, None),
//     * UnionField(u'view_and_comment', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'edit').
//     */
//     permission_level?: DropboxTypes$paper$PaperDocPermissionLevel;

//     /**
//     * User which should be added to the Paper doc. Specify only email address
//     * or Dropbox account ID.
//     */
//     member: DropboxTypes$sharing$MemberSelector;
//   }

//   declare type DropboxTypes$paper$AddPaperDocUser = {
//     /**
//     * User which should be added to the Paper doc. Specify only email address
//     * or Dropbox account ID.
//     */
//     members: Array<DropboxTypes$paper$AddMember>,

//     /**
//     * A personal message that will be emailed to each successfully added
//     * member.
//     */
//     custom_message?: string,

//     /**
//     * Defaults to False.
//     */
//     quiet?: boolean,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   /**
//   * Per-member result for docsUsersAdd().
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserMemberResult {
//     /**
//     * One of specified input members.
//     */
//     member: DropboxTypes$sharing$MemberSelector;

//     /**
//     * The outcome of the action on this member.
//     */
//     result: DropboxTypes$paper$AddPaperDocUserResult;
//   }

//   /**
//   * User was successfully added to the Paper doc.
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserResultSuccess {
//     ".tag": "success";
//   }

//   /**
//   * Something unexpected happened when trying to add the user to the Paper
//   * doc.
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserResultUnknownError {
//     ".tag": "unknown_error";
//   }

//   /**
//   * The Paper doc can be shared only with team members.
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserResultSharingOutsideTeamDisabled {
//     ".tag": "sharing_outside_team_disabled";
//   }

//   /**
//   * The daily limit of how many users can be added to the Paper doc was
//   * reached.
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserResultDailyLimitReached {
//     ".tag": "daily_limit_reached";
//   }

//   /**
//   * Owner's permissions cannot be changed.
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserResultUserIsOwner {
//     ".tag": "user_is_owner";
//   }

//   /**
//   * User data could not be retrieved. Clients should retry.
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserResultFailedUserDataRetrieval {
//     ".tag": "failed_user_data_retrieval";
//   }

//   /**
//   * This user already has the correct permission to the Paper doc.
//   */
//   declare interface DropboxTypes$paper$AddPaperDocUserResultPermissionAlreadyGranted {
//     ".tag": "permission_already_granted";
//   }

//   declare interface DropboxTypes$paper$AddPaperDocUserResultOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$AddPaperDocUserResult =
//     | DropboxTypes$paper$AddPaperDocUserResultSuccess
//     | DropboxTypes$paper$AddPaperDocUserResultUnknownError
//     | DropboxTypes$paper$AddPaperDocUserResultSharingOutsideTeamDisabled
//     | DropboxTypes$paper$AddPaperDocUserResultDailyLimitReached
//     | DropboxTypes$paper$AddPaperDocUserResultUserIsOwner
//     | DropboxTypes$paper$AddPaperDocUserResultFailedUserDataRetrieval
//     | DropboxTypes$paper$AddPaperDocUserResultPermissionAlreadyGranted
//     | DropboxTypes$paper$AddPaperDocUserResultOther;

//   declare interface DropboxTypes$paper$Cursor {
//     /**
//     * The actual cursor value.
//     */
//     value: string;

//     /**
//     * Expiration time of value. Some cursors might have expiration time
//     * assigned. This is a UTC value after which the cursor is no longer valid
//     * and the API starts returning an error. If cursor expires a new one
//     * needs to be obtained and pagination needs to be restarted. Some cursors
//     * might be short-lived some cursors might be long-lived. This really
//     * depends on the sorting type and order, e.g.: 1. on one hand, listing
//     * docs created by the user, sorted by the created time ascending will
//     * have undefinite expiration because the results cannot change while the
//     * iteration is happening. This cursor would be suitable for long term
//     * polling. 2. on the other hand, listing docs sorted by the last modified
//     * time will have a very short expiration as docs do get modified very
//     * often and the modified time can be changed while the iteration is
//     * happening thus altering the results.
//     */
//     expiration?: DropboxTypes$common$DropboxTimestamp;
//   }

//   /**
//   * The required doc was not found.
//   */
//   declare interface DropboxTypes$paper$DocLookupErrorDocNotFound {
//     ".tag": "doc_not_found";
//   }

//   declare type DropboxTypes$paper$DocLookupError =
//     | DropboxTypes$paper$PaperApiBaseError
//     | DropboxTypes$paper$DocLookupErrorDocNotFound;

//   /**
//   * No change email messages unless you're the creator.
//   */
//   declare interface DropboxTypes$paper$DocSubscriptionLevelDefault {
//     ".tag": "default";
//   }

//   /**
//   * Ignored: Not shown in pad lists or activity and no email message is sent.
//   */
//   declare interface DropboxTypes$paper$DocSubscriptionLevelIgnore {
//     ".tag": "ignore";
//   }

//   /**
//   * Subscribed: Shown in pad lists and activity and change email messages are
//   * sent.
//   */
//   declare interface DropboxTypes$paper$DocSubscriptionLevelEvery {
//     ".tag": "every";
//   }

//   /**
//   * Unsubscribed: Shown in pad lists, but not in activity and no change email
//   * messages are sent.
//   */
//   declare interface DropboxTypes$paper$DocSubscriptionLevelNoEmail {
//     ".tag": "no_email";
//   }

//   /**
//   * The subscription level of a Paper doc.
//   */
//   declare type DropboxTypes$paper$DocSubscriptionLevel =
//     | DropboxTypes$paper$DocSubscriptionLevelDefault
//     | DropboxTypes$paper$DocSubscriptionLevelIgnore
//     | DropboxTypes$paper$DocSubscriptionLevelEvery
//     | DropboxTypes$paper$DocSubscriptionLevelNoEmail;

//   /**
//   * The HTML declare format.
//   */
//   declare interface DropboxTypes$paper$ExportFormatHtml {
//     ".tag": "html";
//   }

//   /**
//   * The markdown declare format.
//   */
//   declare interface DropboxTypes$paper$ExportFormatMarkdown {
//     ".tag": "markdown";
//   }

//   declare interface DropboxTypes$paper$ExportFormatOther {
//     ".tag": "other";
//   }

//   /**
//   * The desired declare format of the Paper doc.
//   */
//   declare type DropboxTypes$paper$ExportFormat =
//     | DropboxTypes$paper$ExportFormatHtml
//     | DropboxTypes$paper$ExportFormatMarkdown
//     | DropboxTypes$paper$ExportFormatOther;

//   /**
//   * Data structure representing a Paper folder.
//   */
//   declare interface DropboxTypes$paper$Folder {
//     /**
//     * Paper folder ID. This ID uniquely identifies the folder.
//     */
//     id: string;

//     /**
//     * Paper folder name.
//     */
//     name: string;
//   }

//   /**
//   * Everyone in your team and anyone directly invited can access this folder.
//   */
//   declare interface DropboxTypes$paper$FolderSharingPolicyTypeTeam {
//     ".tag": "team";
//   }

//   /**
//   * Only people directly invited can access this folder.
//   */
//   declare interface DropboxTypes$paper$FolderSharingPolicyTypeInviteOnly {
//     ".tag": "invite_only";
//   }

//   /**
//   * The sharing policy of a Paper folder.  Note: The sharing policy of
//   * subfolders is inherited from the root folder.
//   */
//   declare type DropboxTypes$paper$FolderSharingPolicyType =
//     | DropboxTypes$paper$FolderSharingPolicyTypeTeam
//     | DropboxTypes$paper$FolderSharingPolicyTypeInviteOnly;

//   /**
//   * Not shown in activity, no email messages.
//   */
//   declare interface DropboxTypes$paper$FolderSubscriptionLevelNone {
//     ".tag": "none";
//   }

//   /**
//   * Shown in activity, no email messages.
//   */
//   declare interface DropboxTypes$paper$FolderSubscriptionLevelActivityOnly {
//     ".tag": "activity_only";
//   }

//   /**
//   * Shown in activity, daily email messages.
//   */
//   declare interface DropboxTypes$paper$FolderSubscriptionLevelDailyEmails {
//     ".tag": "daily_emails";
//   }

//   /**
//   * Shown in activity, weekly email messages.
//   */
//   declare interface DropboxTypes$paper$FolderSubscriptionLevelWeeklyEmails {
//     ".tag": "weekly_emails";
//   }

//   /**
//   * The subscription level of a Paper folder.
//   */
//   declare type DropboxTypes$paper$FolderSubscriptionLevel =
//     | DropboxTypes$paper$FolderSubscriptionLevelNone
//     | DropboxTypes$paper$FolderSubscriptionLevelActivityOnly
//     | DropboxTypes$paper$FolderSubscriptionLevelDailyEmails
//     | DropboxTypes$paper$FolderSubscriptionLevelWeeklyEmails;

//   /**
//   * Metadata about Paper folders containing the specififed Paper doc.
//   */
//   declare interface DropboxTypes$paper$FoldersContainingPaperDoc {
//     /**
//     * The sharing policy of the folder containing the Paper doc.
//     */
//     folder_sharing_policy_type?: DropboxTypes$paper$FolderSharingPolicyType;

//     /**
//     * The folder path. If present the first folder is the root folder.
//     */
//     folders?: Array<DropboxTypes$paper$Folder>;
//   }

//   /**
//   * The provided data is interpreted as standard HTML.
//   */
//   declare interface DropboxTypes$paper$ImportFormatHtml {
//     ".tag": "html";
//   }

//   /**
//   * The provided data is interpreted as markdown. Note: The first line of the
//   * provided document will be used as the doc title.
//   */
//   declare interface DropboxTypes$paper$ImportFormatMarkdown {
//     ".tag": "markdown";
//   }

//   /**
//   * The provided data is interpreted as plain text. Note: The first line of
//   * the provided document will be used as the doc title.
//   */
//   declare interface DropboxTypes$paper$ImportFormatPlainText {
//     ".tag": "plain_text";
//   }

//   declare interface DropboxTypes$paper$ImportFormatOther {
//     ".tag": "other";
//   }

//   /**
//   * The import format of the incoming data.
//   */
//   declare type DropboxTypes$paper$ImportFormat =
//     | DropboxTypes$paper$ImportFormatHtml
//     | DropboxTypes$paper$ImportFormatMarkdown
//     | DropboxTypes$paper$ImportFormatPlainText
//     | DropboxTypes$paper$ImportFormatOther;

//   declare interface DropboxTypes$paper$InviteeInfoWithPermissionLevel {
//     /**
//     * Email address invited to the Paper doc.
//     */
//     invitee: DropboxTypes$sharing$InviteeInfo;

//     /**
//     * Permission level for the invitee.
//     */
//     permission_level: DropboxTypes$paper$PaperDocPermissionLevel;
//   }

//   declare interface DropboxTypes$paper$ListDocsCursorErrorCursorError {
//     ".tag": "cursor_error";
//     cursor_error: DropboxTypes$paper$PaperApiCursorError;
//   }

//   declare interface DropboxTypes$paper$ListDocsCursorErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$ListDocsCursorError =
//     | DropboxTypes$paper$ListDocsCursorErrorCursorError
//     | DropboxTypes$paper$ListDocsCursorErrorOther;

//   declare interface DropboxTypes$paper$ListPaperDocsArgs {
//     /**
//     * Defaults to TagRef(Union(u'ListPaperDocsFilterBy',
//     * [UnionField(u'docs_accessed', Void, False, None),
//     * UnionField(u'docs_created', Void, False, None), UnionField(u'other',
//     * Void, True, None)]), u'docs_accessed').
//     */
//     filter_by?: DropboxTypes$paper$ListPaperDocsFilterBy;

//     /**
//     * Defaults to TagRef(Union(u'ListPaperDocsSortBy',
//     * [UnionField(u'accessed', Void, False, None), UnionField(u'modified',
//     * Void, False, None), UnionField(u'created', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'accessed').
//     */
//     sort_by?: DropboxTypes$paper$ListPaperDocsSortBy;

//     /**
//     * Defaults to TagRef(Union(u'ListPaperDocsSortOrder',
//     * [UnionField(u'ascending', Void, False, None), UnionField(u'descending',
//     * Void, False, None), UnionField(u'other', Void, True, None)]),
//     * u'ascending').
//     */
//     sort_order?: DropboxTypes$paper$ListPaperDocsSortOrder;

//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$paper$ListPaperDocsContinueArgs {
//     /**
//     * The cursor obtained from docsList() or docsListContinue(). Allows for
//     * pagination.
//     */
//     cursor: string;
//   }

//   /**
//   * Fetches all Paper doc IDs that the user has ever accessed.
//   */
//   declare interface DropboxTypes$paper$ListPaperDocsFilterByDocsAccessed {
//     ".tag": "docs_accessed";
//   }

//   /**
//   * Fetches only the Paper doc IDs that the user has created.
//   */
//   declare interface DropboxTypes$paper$ListPaperDocsFilterByDocsCreated {
//     ".tag": "docs_created";
//   }

//   declare interface DropboxTypes$paper$ListPaperDocsFilterByOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$ListPaperDocsFilterBy =
//     | DropboxTypes$paper$ListPaperDocsFilterByDocsAccessed
//     | DropboxTypes$paper$ListPaperDocsFilterByDocsCreated
//     | DropboxTypes$paper$ListPaperDocsFilterByOther;

//   declare interface DropboxTypes$paper$ListPaperDocsResponse {
//     /**
//     * The list of Paper doc IDs that can be used to access the given Paper
//     * docs or supplied to other API methods. The list is sorted in the order
//     * specified by the initial call to docsList().
//     */
//     doc_ids: Array<DropboxTypes$paper$PaperDocId>;

//     /**
//     * Pass the cursor into docsListContinue() to paginate through all files.
//     * The cursor preserves all properties as specified in the original call
//     * to docsList().
//     */
//     cursor: DropboxTypes$paper$Cursor;

//     /**
//     * Will be set to True if a subsequent call with the provided cursor to
//     * docsListContinue() returns immediately with some results. If set to
//     * False please allow some delay before making another call to
//     * docsListContinue().
//     */
//     has_more: boolean;
//   }

//   /**
//   * Sorts the Paper docs by the time they were last accessed.
//   */
//   declare interface DropboxTypes$paper$ListPaperDocsSortByAccessed {
//     ".tag": "accessed";
//   }

//   /**
//   * Sorts the Paper docs by the time they were last modified.
//   */
//   declare interface DropboxTypes$paper$ListPaperDocsSortByModified {
//     ".tag": "modified";
//   }

//   /**
//   * Sorts the Paper docs by the creation time.
//   */
//   declare interface DropboxTypes$paper$ListPaperDocsSortByCreated {
//     ".tag": "created";
//   }

//   declare interface DropboxTypes$paper$ListPaperDocsSortByOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$ListPaperDocsSortBy =
//     | DropboxTypes$paper$ListPaperDocsSortByAccessed
//     | DropboxTypes$paper$ListPaperDocsSortByModified
//     | DropboxTypes$paper$ListPaperDocsSortByCreated
//     | DropboxTypes$paper$ListPaperDocsSortByOther;

//   /**
//   * Sorts the search result in ascending order.
//   */
//   declare interface DropboxTypes$paper$ListPaperDocsSortOrderAscending {
//     ".tag": "ascending";
//   }

//   /**
//   * Sorts the search result in descending order.
//   */
//   declare interface DropboxTypes$paper$ListPaperDocsSortOrderDescending {
//     ".tag": "descending";
//   }

//   declare interface DropboxTypes$paper$ListPaperDocsSortOrderOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$ListPaperDocsSortOrder =
//     | DropboxTypes$paper$ListPaperDocsSortOrderAscending
//     | DropboxTypes$paper$ListPaperDocsSortOrderDescending
//     | DropboxTypes$paper$ListPaperDocsSortOrderOther;

//   /**
//   * The required doc was not found.
//   */
//   declare interface DropboxTypes$paper$ListUsersCursorErrorDocNotFound {
//     ".tag": "doc_not_found";
//   }

//   declare interface DropboxTypes$paper$ListUsersCursorErrorCursorError {
//     ".tag": "cursor_error";
//     cursor_error: DropboxTypes$paper$PaperApiCursorError;
//   }

//   declare type DropboxTypes$paper$ListUsersCursorError =
//     | DropboxTypes$paper$PaperApiBaseError
//     | DropboxTypes$paper$ListUsersCursorErrorDocNotFound
//     | DropboxTypes$paper$ListUsersCursorErrorCursorError;

//   declare type DropboxTypes$paper$ListUsersOnFolderArgs = {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   declare type DropboxTypes$paper$ListUsersOnFolderContinueArgs = {
//     /**
//     * The cursor obtained from docsFolderUsersList() or
//     * docsFolderUsersListContinue(). Allows for pagination.
//     */
//     cursor: string,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   declare interface DropboxTypes$paper$ListUsersOnFolderResponse {
//     /**
//     * List of email addresses that are invited on the Paper folder.
//     */
//     invitees: Array<DropboxTypes$sharing$InviteeInfo>;

//     /**
//     * List of users that are invited on the Paper folder.
//     */
//     users: Array<DropboxTypes$sharing$UserInfo>;

//     /**
//     * Pass the cursor into docsFolderUsersListContinue() to paginate through
//     * all users. The cursor preserves all properties as specified in the
//     * original call to docsFolderUsersList().
//     */
//     cursor: DropboxTypes$paper$Cursor;

//     /**
//     * Will be set to True if a subsequent call with the provided cursor to
//     * docsFolderUsersListContinue() returns immediately with some results. If
//     * set to False please allow some delay before making another call to
//     * docsFolderUsersListContinue().
//     */
//     has_more: boolean;
//   }

//   declare type DropboxTypes$paper$ListUsersOnPaperDocArgs = {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number,

//     /**
//     * Defaults to TagRef(Union(u'UserOnPaperDocFilter',
//     * [UnionField(u'visited', Void, False, None), UnionField(u'shared', Void,
//     * False, None), UnionField(u'other', Void, True, None)]), u'shared').
//     */
//     filter_by?: DropboxTypes$paper$UserOnPaperDocFilter,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   declare type DropboxTypes$paper$ListUsersOnPaperDocContinueArgs = {
//     /**
//     * The cursor obtained from docsUsersList() or docsUsersListContinue().
//     * Allows for pagination.
//     */
//     cursor: string,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   declare interface DropboxTypes$paper$ListUsersOnPaperDocResponse {
//     /**
//     * List of email addresses with their respective permission levels that
//     * are invited on the Paper doc.
//     */
//     invitees: Array<DropboxTypes$paper$InviteeInfoWithPermissionLevel>;

//     /**
//     * List of users with their respective permission levels that are invited
//     * on the Paper folder.
//     */
//     users: Array<DropboxTypes$paper$UserInfoWithPermissionLevel>;

//     /**
//     * The Paper doc owner. This field is populated on every single response.
//     */
//     doc_owner: DropboxTypes$sharing$UserInfo;

//     /**
//     * Pass the cursor into docsUsersListContinue() to paginate through all
//     * users. The cursor preserves all properties as specified in the original
//     * call to docsUsersList().
//     */
//     cursor: DropboxTypes$paper$Cursor;

//     /**
//     * Will be set to True if a subsequent call with the provided cursor to
//     * docsUsersListContinue() returns immediately with some results. If set
//     * to False please allow some delay before making another call to
//     * docsUsersListContinue().
//     */
//     has_more: boolean;
//   }

//   /**
//   * Your account does not have permissions to perform this action.
//   */
//   declare interface DropboxTypes$paper$PaperApiBaseErrorInsufficientPermissions {
//     ".tag": "insufficient_permissions";
//   }

//   declare interface DropboxTypes$paper$PaperApiBaseErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$PaperApiBaseError =
//     | DropboxTypes$paper$PaperApiBaseErrorInsufficientPermissions
//     | DropboxTypes$paper$PaperApiBaseErrorOther;

//   /**
//   * The provided cursor is expired.
//   */
//   declare interface DropboxTypes$paper$PaperApiCursorErrorExpiredCursor {
//     ".tag": "expired_cursor";
//   }

//   /**
//   * The provided cursor is invalid.
//   */
//   declare interface DropboxTypes$paper$PaperApiCursorErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   /**
//   * The provided cursor contains invalid user.
//   */
//   declare interface DropboxTypes$paper$PaperApiCursorErrorWrongUserInCursor {
//     ".tag": "wrong_user_in_cursor";
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call the corresponding
//   * non-continue endpoint to obtain a new cursor.
//   */
//   declare interface DropboxTypes$paper$PaperApiCursorErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$paper$PaperApiCursorErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$PaperApiCursorError =
//     | DropboxTypes$paper$PaperApiCursorErrorExpiredCursor
//     | DropboxTypes$paper$PaperApiCursorErrorInvalidCursor
//     | DropboxTypes$paper$PaperApiCursorErrorWrongUserInCursor
//     | DropboxTypes$paper$PaperApiCursorErrorReset
//     | DropboxTypes$paper$PaperApiCursorErrorOther;

//   declare interface DropboxTypes$paper$PaperDocCreateArgs {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object;

//     /**
//     * The Paper folder ID where the Paper document should be created. The API
//     * user has to have write access to this folder or error is thrown.
//     */
//     parent_folder_id?: string;

//     /**
//     * The format of provided data.
//     */
//     import_format: DropboxTypes$paper$ImportFormat;
//   }

//   /**
//   * The provided content was malformed and cannot be imported to Paper.
//   */
//   declare interface DropboxTypes$paper$PaperDocCreateErrorContentMalformed {
//     ".tag": "content_malformed";
//   }

//   /**
//   * The specified Paper folder is cannot be found.
//   */
//   declare interface DropboxTypes$paper$PaperDocCreateErrorFolderNotFound {
//     ".tag": "folder_not_found";
//   }

//   /**
//   * The newly created Paper doc would be too large. Please split the content
//   * into multiple docs.
//   */
//   declare interface DropboxTypes$paper$PaperDocCreateErrorDocLengthExceeded {
//     ".tag": "doc_length_exceeded";
//   }

//   /**
//   * The imported document contains an image that is too large. The current
//   * limit is 1MB. Note: This only applies to HTML with data uri.
//   */
//   declare interface DropboxTypes$paper$PaperDocCreateErrorImageSizeExceeded {
//     ".tag": "image_size_exceeded";
//   }

//   declare type DropboxTypes$paper$PaperDocCreateError =
//     | DropboxTypes$paper$PaperApiBaseError
//     | DropboxTypes$paper$PaperDocCreateErrorContentMalformed
//     | DropboxTypes$paper$PaperDocCreateErrorFolderNotFound
//     | DropboxTypes$paper$PaperDocCreateErrorDocLengthExceeded
//     | DropboxTypes$paper$PaperDocCreateErrorImageSizeExceeded;

//   declare interface DropboxTypes$paper$PaperDocCreateUpdateResult {
//     /**
//     * Doc ID of the newly created doc.
//     */
//     doc_id: string;

//     /**
//     * The Paper doc revision. Simply an ever increasing number.
//     */
//     revision: number;

//     /**
//     * The Paper doc title.
//     */
//     title: string;
//   }

//   declare type DropboxTypes$paper$PaperDocExport = {
//     export_format: DropboxTypes$paper$ExportFormat,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   declare interface DropboxTypes$paper$PaperDocExportResult {
//     /**
//     * The Paper doc owner's email address.
//     */
//     owner: string;

//     /**
//     * The Paper doc title.
//     */
//     title: string;

//     /**
//     * The Paper doc revision. Simply an ever increasing number.
//     */
//     revision: number;

//     /**
//     * MIME type of the declare. This corresponds to paper.ExportFormat
//     * specified in the request.
//     */
//     mime_type: string;
//   }

//   /**
//   * User will be granted edit permissions.
//   */
//   declare interface DropboxTypes$paper$PaperDocPermissionLevelEdit {
//     ".tag": "edit";
//   }

//   /**
//   * User will be granted view and comment permissions.
//   */
//   declare interface DropboxTypes$paper$PaperDocPermissionLevelViewAndComment {
//     ".tag": "view_and_comment";
//   }

//   declare interface DropboxTypes$paper$PaperDocPermissionLevelOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$PaperDocPermissionLevel =
//     | DropboxTypes$paper$PaperDocPermissionLevelEdit
//     | DropboxTypes$paper$PaperDocPermissionLevelViewAndComment
//     | DropboxTypes$paper$PaperDocPermissionLevelOther;

//   declare type DropboxTypes$paper$PaperDocSharingPolicy = {
//     /**
//     * The default sharing policy to be set for the Paper doc.
//     */
//     sharing_policy: DropboxTypes$paper$SharingPolicy,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   declare type DropboxTypes$paper$PaperDocUpdateArgs = {
//     /**
//     * The file contents to be uploaded.
//     */
//     contents: Object,

//     /**
//     * The policy used for the current update call.
//     */
//     doc_update_policy: DropboxTypes$paper$PaperDocUpdatePolicy,

//     /**
//     * The latest doc revision. This value must match the head revision or an
//     * error code will be returned. This is to prevent colliding writes.
//     */
//     revision: number,

//     /**
//     * The format of provided data.
//     */
//     import_format: DropboxTypes$paper$ImportFormat,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   /**
//   * The provided content was malformed and cannot be imported to Paper.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdateErrorContentMalformed {
//     ".tag": "content_malformed";
//   }

//   /**
//   * The provided revision does not match the document head.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdateErrorRevisionMismatch {
//     ".tag": "revision_mismatch";
//   }

//   /**
//   * The newly created Paper doc would be too large, split the content into
//   * multiple docs.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdateErrorDocLengthExceeded {
//     ".tag": "doc_length_exceeded";
//   }

//   /**
//   * The imported document contains an image that is too large. The current
//   * limit is 1MB. Note: This only applies to HTML with data uri.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdateErrorImageSizeExceeded {
//     ".tag": "image_size_exceeded";
//   }

//   /**
//   * This operation is not allowed on archived Paper docs.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdateErrorDocArchived {
//     ".tag": "doc_archived";
//   }

//   /**
//   * This operation is not allowed on deleted Paper docs.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdateErrorDocDeleted {
//     ".tag": "doc_deleted";
//   }

//   declare type DropboxTypes$paper$PaperDocUpdateError =
//     | DropboxTypes$paper$DocLookupError
//     | DropboxTypes$paper$PaperDocUpdateErrorContentMalformed
//     | DropboxTypes$paper$PaperDocUpdateErrorRevisionMismatch
//     | DropboxTypes$paper$PaperDocUpdateErrorDocLengthExceeded
//     | DropboxTypes$paper$PaperDocUpdateErrorImageSizeExceeded
//     | DropboxTypes$paper$PaperDocUpdateErrorDocArchived
//     | DropboxTypes$paper$PaperDocUpdateErrorDocDeleted;

//   /**
//   * The content will be appended to the doc.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdatePolicyAppend {
//     ".tag": "append";
//   }

//   /**
//   * The content will be prepended to the doc. Note: the doc title will not be
//   * affected.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdatePolicyPrepend {
//     ".tag": "prepend";
//   }

//   /**
//   * The document will be overwitten at the head with the provided content.
//   */
//   declare interface DropboxTypes$paper$PaperDocUpdatePolicyOverwriteAll {
//     ".tag": "overwrite_all";
//   }

//   declare interface DropboxTypes$paper$PaperDocUpdatePolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$PaperDocUpdatePolicy =
//     | DropboxTypes$paper$PaperDocUpdatePolicyAppend
//     | DropboxTypes$paper$PaperDocUpdatePolicyPrepend
//     | DropboxTypes$paper$PaperDocUpdatePolicyOverwriteAll
//     | DropboxTypes$paper$PaperDocUpdatePolicyOther;

//   declare interface DropboxTypes$paper$RefPaperDoc {
//     /**
//     * The Paper doc ID.
//     */
//     doc_id: DropboxTypes$paper$PaperDocId;
//   }

//   declare type DropboxTypes$paper$RemovePaperDocUser = {
//     /**
//     * User which should be removed from the Paper doc. Specify only email
//     * address or Dropbox account ID.
//     */
//     member: DropboxTypes$sharing$MemberSelector,
//     ...
//   } & DropboxTypes$paper$RefPaperDoc;

//   /**
//   * Sharing policy of Paper doc.
//   */
//   declare interface DropboxTypes$paper$SharingPolicy {
//     /**
//     * This value applies to the non-team members.
//     */
//     public_sharing_policy?: DropboxTypes$paper$SharingPublicPolicyType;

//     /**
//     * This value applies to the team members only. The value is null for all
//     * personal accounts.
//     */
//     team_sharing_policy?: DropboxTypes$paper$SharingTeamPolicyType;
//   }

//   /**
//   * Value used to indicate that doc sharing is enabled only within team.
//   */
//   declare interface DropboxTypes$paper$SharingPublicPolicyTypeDisabled {
//     ".tag": "disabled";
//   }

//   declare type DropboxTypes$paper$SharingPublicPolicyType =
//     | DropboxTypes$paper$SharingTeamPolicyType
//     | DropboxTypes$paper$SharingPublicPolicyTypeDisabled;

//   /**
//   * Users who have a link to this doc can edit it.
//   */
//   declare interface DropboxTypes$paper$SharingTeamPolicyTypePeopleWithLinkCanEdit {
//     ".tag": "people_with_link_can_edit";
//   }

//   /**
//   * Users who have a link to this doc can view and comment on it.
//   */
//   declare interface DropboxTypes$paper$SharingTeamPolicyTypePeopleWithLinkCanViewAndComment {
//     ".tag": "people_with_link_can_view_and_comment";
//   }

//   /**
//   * Users must be explicitly invited to this doc.
//   */
//   declare interface DropboxTypes$paper$SharingTeamPolicyTypeInviteOnly {
//     ".tag": "invite_only";
//   }

//   /**
//   * The sharing policy type of the Paper doc.
//   */
//   declare type DropboxTypes$paper$SharingTeamPolicyType =
//     | DropboxTypes$paper$SharingTeamPolicyTypePeopleWithLinkCanEdit
//     | DropboxTypes$paper$SharingTeamPolicyTypePeopleWithLinkCanViewAndComment
//     | DropboxTypes$paper$SharingTeamPolicyTypeInviteOnly;

//   declare interface DropboxTypes$paper$UserInfoWithPermissionLevel {
//     /**
//     * User shared on the Paper doc.
//     */
//     user: DropboxTypes$sharing$UserInfo;

//     /**
//     * Permission level for the user.
//     */
//     permission_level: DropboxTypes$paper$PaperDocPermissionLevel;
//   }

//   /**
//   * all users who have visited the Paper doc.
//   */
//   declare interface DropboxTypes$paper$UserOnPaperDocFilterVisited {
//     ".tag": "visited";
//   }

//   /**
//   * All uses who are shared on the Paper doc. This includes all users who
//   * have visited the Paper doc as well as those who have not.
//   */
//   declare interface DropboxTypes$paper$UserOnPaperDocFilterShared {
//     ".tag": "shared";
//   }

//   declare interface DropboxTypes$paper$UserOnPaperDocFilterOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$paper$UserOnPaperDocFilter =
//     | DropboxTypes$paper$UserOnPaperDocFilterVisited
//     | DropboxTypes$paper$UserOnPaperDocFilterShared
//     | DropboxTypes$paper$UserOnPaperDocFilterOther;

//   declare type DropboxTypes$paper$PaperDocId = string;

//   /**
//   * The content was viewed on the web.
//   */
//   declare interface DropboxTypes$seen_state$PlatformTypeWeb {
//     ".tag": "web";
//   }

//   /**
//   * The content was viewed on a desktop client.
//   */
//   declare interface DropboxTypes$seen_state$PlatformTypeDesktop {
//     ".tag": "desktop";
//   }

//   /**
//   * The content was viewed on a mobile iOS client.
//   */
//   declare interface DropboxTypes$seen_state$PlatformTypeMobileIos {
//     ".tag": "mobile_ios";
//   }

//   /**
//   * The content was viewed on a mobile android client.
//   */
//   declare interface DropboxTypes$seen_state$PlatformTypeMobileAndroid {
//     ".tag": "mobile_android";
//   }

//   /**
//   * The content was viewed from an API client.
//   */
//   declare interface DropboxTypes$seen_state$PlatformTypeApi {
//     ".tag": "api";
//   }

//   /**
//   * The content was viewed on an unknown platform.
//   */
//   declare interface DropboxTypes$seen_state$PlatformTypeUnknown {
//     ".tag": "unknown";
//   }

//   /**
//   * The content was viewed on a mobile client. DEPRECATED: Use mobile_ios or
//   * mobile_android instead.
//   */
//   declare interface DropboxTypes$seen_state$PlatformTypeMobile {
//     ".tag": "mobile";
//   }

//   declare interface DropboxTypes$seen_state$PlatformTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * Possible platforms on which a user may view content.
//   */
//   declare type DropboxTypes$seen_state$PlatformType =
//     | DropboxTypes$seen_state$PlatformTypeWeb
//     | DropboxTypes$seen_state$PlatformTypeDesktop
//     | DropboxTypes$seen_state$PlatformTypeMobileIos
//     | DropboxTypes$seen_state$PlatformTypeMobileAndroid
//     | DropboxTypes$seen_state$PlatformTypeApi
//     | DropboxTypes$seen_state$PlatformTypeUnknown
//     | DropboxTypes$seen_state$PlatformTypeMobile
//     | DropboxTypes$seen_state$PlatformTypeOther;

//   /**
//   * The shared folder inherits its members from the parent folder.
//   */
//   declare interface DropboxTypes$sharing$AccessInheritanceInherit {
//     ".tag": "inherit";
//   }

//   /**
//   * The shared folder does not inherit its members from the parent folder.
//   */
//   declare interface DropboxTypes$sharing$AccessInheritanceNoInherit {
//     ".tag": "no_inherit";
//   }

//   declare interface DropboxTypes$sharing$AccessInheritanceOther {
//     ".tag": "other";
//   }

//   /**
//   * Information about the inheritance policy of a shared folder.
//   */
//   declare type DropboxTypes$sharing$AccessInheritance =
//     | DropboxTypes$sharing$AccessInheritanceInherit
//     | DropboxTypes$sharing$AccessInheritanceNoInherit
//     | DropboxTypes$sharing$AccessInheritanceOther;

//   /**
//   * The collaborator is the owner of the shared folder. Owners can view and
//   * edit the shared folder as well as set the folder's policies using
//   * updateFolderPolicy().
//   */
//   declare interface DropboxTypes$sharing$AccessLevelOwner {
//     ".tag": "owner";
//   }

//   /**
//   * The collaborator can both view and edit the shared folder.
//   */
//   declare interface DropboxTypes$sharing$AccessLevelEditor {
//     ".tag": "editor";
//   }

//   /**
//   * The collaborator can only view the shared folder.
//   */
//   declare interface DropboxTypes$sharing$AccessLevelViewer {
//     ".tag": "viewer";
//   }

//   /**
//   * The collaborator can only view the shared folder and does not have any
//   * access to comments.
//   */
//   declare interface DropboxTypes$sharing$AccessLevelViewerNoComment {
//     ".tag": "viewer_no_comment";
//   }

//   declare interface DropboxTypes$sharing$AccessLevelOther {
//     ".tag": "other";
//   }

//   /**
//   * Defines the access levels for collaborators.
//   */
//   declare type DropboxTypes$sharing$AccessLevel =
//     | DropboxTypes$sharing$AccessLevelOwner
//     | DropboxTypes$sharing$AccessLevelEditor
//     | DropboxTypes$sharing$AccessLevelViewer
//     | DropboxTypes$sharing$AccessLevelViewerNoComment
//     | DropboxTypes$sharing$AccessLevelOther;

//   /**
//   * Only the owner can update the ACL.
//   */
//   declare interface DropboxTypes$sharing$AclUpdatePolicyOwner {
//     ".tag": "owner";
//   }

//   /**
//   * Any editor can update the ACL. This may be further restricted to editors
//   * on the same team.
//   */
//   declare interface DropboxTypes$sharing$AclUpdatePolicyEditors {
//     ".tag": "editors";
//   }

//   declare interface DropboxTypes$sharing$AclUpdatePolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Who can change a shared folder's access control list (ACL). In other
//   * words, who can add, remove, or change the privileges of members.
//   */
//   declare type DropboxTypes$sharing$AclUpdatePolicy =
//     | DropboxTypes$sharing$AclUpdatePolicyOwner
//     | DropboxTypes$sharing$AclUpdatePolicyEditors
//     | DropboxTypes$sharing$AclUpdatePolicyOther;

//   /**
//   * Arguments for addFileMember().
//   */
//   declare interface DropboxTypes$sharing$AddFileMemberArgs {
//     /**
//     * File to which to add members.
//     */
//     file: DropboxTypes$sharing$PathOrId;

//     /**
//     * Members to add. Note that even an email address is given, this may
//     * result in a user being directy added to the membership if that email is
//     * the user's main account email.
//     */
//     members: Array<DropboxTypes$sharing$MemberSelector>;

//     /**
//     * Message to send to added members in their invitation.
//     */
//     custom_message?: string;

//     /**
//     * Defaults to False.
//     */
//     quiet?: boolean;

//     /**
//     * Defaults to TagRef(Union(u'AccessLevel', [UnionField(u'owner', Void,
//     * False, None), UnionField(u'editor', Void, False, None),
//     * UnionField(u'viewer', Void, False, None),
//     * UnionField(u'viewer_no_comment', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'viewer').
//     */
//     access_level?: DropboxTypes$sharing$AccessLevel;

//     /**
//     * Defaults to False.
//     */
//     add_message_as_comment?: boolean;
//   }

//   declare interface DropboxTypes$sharing$AddFileMemberErrorUserError {
//     ".tag": "user_error";
//     user_error: DropboxTypes$sharing$SharingUserError;
//   }

//   declare interface DropboxTypes$sharing$AddFileMemberErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   /**
//   * The user has reached the rate limit for invitations.
//   */
//   declare interface DropboxTypes$sharing$AddFileMemberErrorRateLimit {
//     ".tag": "rate_limit";
//   }

//   /**
//   * The custom message did not pass comment permissions checks.
//   */
//   declare interface DropboxTypes$sharing$AddFileMemberErrorInvalidComment {
//     ".tag": "invalid_comment";
//   }

//   declare interface DropboxTypes$sharing$AddFileMemberErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Errors for addFileMember().
//   */
//   declare type DropboxTypes$sharing$AddFileMemberError =
//     | DropboxTypes$sharing$AddFileMemberErrorUserError
//     | DropboxTypes$sharing$AddFileMemberErrorAccessError
//     | DropboxTypes$sharing$AddFileMemberErrorRateLimit
//     | DropboxTypes$sharing$AddFileMemberErrorInvalidComment
//     | DropboxTypes$sharing$AddFileMemberErrorOther;

//   declare interface DropboxTypes$sharing$AddFolderMemberArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * The intended list of members to add.  Added members will receive
//     * invites to join the shared folder.
//     */
//     members: Array<DropboxTypes$sharing$AddMember>;

//     /**
//     * Defaults to False.
//     */
//     quiet?: boolean;

//     /**
//     * Optional message to display to added members in their invitation.
//     */
//     custom_message?: string;
//   }

//   /**
//   * Unable to access shared folder.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * The current user's e-mail address is unverified.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorEmailUnverified {
//     ".tag": "email_unverified";
//   }

//   /**
//   * The current user has been banned.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorBannedMember {
//     ".tag": "banned_member";
//   }

//   /**
//   * AddFolderMemberArg.members contains a bad invitation recipient.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorBadMember {
//     ".tag": "bad_member";
//     bad_member: DropboxTypes$sharing$AddMemberSelectorError;
//   }

//   /**
//   * Your team policy does not allow sharing outside of the team.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorCantShareOutsideTeam {
//     ".tag": "cant_share_outside_team";
//   }

//   /**
//   * The value is the member limit that was reached.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorTooManyMembers {
//     ".tag": "too_many_members";
//     too_many_members: number;
//   }

//   /**
//   * The value is the pending invite limit that was reached.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorTooManyPendingInvites {
//     ".tag": "too_many_pending_invites";
//     too_many_pending_invites: number;
//   }

//   /**
//   * The current user has hit the limit of invites they can send per day. Try
//   * again in 24 hours.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorRateLimit {
//     ".tag": "rate_limit";
//   }

//   /**
//   * The current user is trying to share with too many people at once.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorTooManyInvitees {
//     ".tag": "too_many_invitees";
//   }

//   /**
//   * The current user's account doesn't support this action. An example of
//   * this is when adding a read-only member. This action can only be performed
//   * by users that have upgraded to a Pro or Business plan.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorInsufficientPlan {
//     ".tag": "insufficient_plan";
//   }

//   /**
//   * This action cannot be performed on a team shared folder.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorTeamFolder {
//     ".tag": "team_folder";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$AddFolderMemberErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   declare interface DropboxTypes$sharing$AddFolderMemberErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$AddFolderMemberError =
//     | DropboxTypes$sharing$AddFolderMemberErrorAccessError
//     | DropboxTypes$sharing$AddFolderMemberErrorEmailUnverified
//     | DropboxTypes$sharing$AddFolderMemberErrorBannedMember
//     | DropboxTypes$sharing$AddFolderMemberErrorBadMember
//     | DropboxTypes$sharing$AddFolderMemberErrorCantShareOutsideTeam
//     | DropboxTypes$sharing$AddFolderMemberErrorTooManyMembers
//     | DropboxTypes$sharing$AddFolderMemberErrorTooManyPendingInvites
//     | DropboxTypes$sharing$AddFolderMemberErrorRateLimit
//     | DropboxTypes$sharing$AddFolderMemberErrorTooManyInvitees
//     | DropboxTypes$sharing$AddFolderMemberErrorInsufficientPlan
//     | DropboxTypes$sharing$AddFolderMemberErrorTeamFolder
//     | DropboxTypes$sharing$AddFolderMemberErrorNoPermission
//     | DropboxTypes$sharing$AddFolderMemberErrorOther;

//   /**
//   * The member and type of access the member should have when added to a
//   * shared folder.
//   */
//   declare interface DropboxTypes$sharing$AddMember {
//     /**
//     * The member to add to the shared folder.
//     */
//     member: DropboxTypes$sharing$MemberSelector;

//     /**
//     * Defaults to TagRef(Union(u'AccessLevel', [UnionField(u'owner', Void,
//     * False, None), UnionField(u'editor', Void, False, None),
//     * UnionField(u'viewer', Void, False, None),
//     * UnionField(u'viewer_no_comment', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'viewer').
//     */
//     access_level?: DropboxTypes$sharing$AccessLevel;
//   }

//   /**
//   * Automatically created groups can only be added to team folders.
//   */
//   declare interface DropboxTypes$sharing$AddMemberSelectorErrorAutomaticGroup {
//     ".tag": "automatic_group";
//   }

//   /**
//   * The value is the ID that could not be identified.
//   */
//   declare interface DropboxTypes$sharing$AddMemberSelectorErrorInvalidDropboxId {
//     ".tag": "invalid_dropbox_id";
//     invalid_dropbox_id: DropboxTypes$sharing$DropboxId;
//   }

//   /**
//   * The value is the e-email address that is malformed.
//   */
//   declare interface DropboxTypes$sharing$AddMemberSelectorErrorInvalidEmail {
//     ".tag": "invalid_email";
//     invalid_email: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * The value is the ID of the Dropbox user with an unverified e-mail
//   * address.  Invite unverified users by e-mail address instead of by their
//   * Dropbox ID.
//   */
//   declare interface DropboxTypes$sharing$AddMemberSelectorErrorUnverifiedDropboxId {
//     ".tag": "unverified_dropbox_id";
//     unverified_dropbox_id: DropboxTypes$sharing$DropboxId;
//   }

//   /**
//   * At least one of the specified groups in AddFolderMemberArg.members is
//   * deleted.
//   */
//   declare interface DropboxTypes$sharing$AddMemberSelectorErrorGroupDeleted {
//     ".tag": "group_deleted";
//   }

//   /**
//   * Sharing to a group that is not on the current user's team.
//   */
//   declare interface DropboxTypes$sharing$AddMemberSelectorErrorGroupNotOnTeam {
//     ".tag": "group_not_on_team";
//   }

//   declare interface DropboxTypes$sharing$AddMemberSelectorErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$AddMemberSelectorError =
//     | DropboxTypes$sharing$AddMemberSelectorErrorAutomaticGroup
//     | DropboxTypes$sharing$AddMemberSelectorErrorInvalidDropboxId
//     | DropboxTypes$sharing$AddMemberSelectorErrorInvalidEmail
//     | DropboxTypes$sharing$AddMemberSelectorErrorUnverifiedDropboxId
//     | DropboxTypes$sharing$AddMemberSelectorErrorGroupDeleted
//     | DropboxTypes$sharing$AddMemberSelectorErrorGroupNotOnTeam
//     | DropboxTypes$sharing$AddMemberSelectorErrorOther;

//   /**
//   * Information about the content that has a link audience different than
//   * that of this folder.
//   */
//   declare interface DropboxTypes$sharing$AudienceExceptionContentInfo {
//     /**
//     * The name of the content, which is either a file or a folder.
//     */
//     name: string;
//   }

//   /**
//   * The total count and truncated list of information of content inside this
//   * folder that has a different audience than the link on this folder. This
//   * is only returned for folders.
//   */
//   declare interface DropboxTypes$sharing$AudienceExceptions {
//     count: number;

//     /**
//     * A truncated list of some of the content that is an exception. The
//     * length of this list could be smaller than the count since it is only a
//     * sample but will not be empty as long as count is not 0.
//     */
//     exceptions: Array<DropboxTypes$sharing$AudienceExceptionContentInfo>;
//   }

//   /**
//   * Information about the shared folder that prevents the link audience for
//   * this link from being more restrictive.
//   */
//   declare interface DropboxTypes$sharing$AudienceRestrictingSharedFolder {
//     /**
//     * The ID of the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * The name of the shared folder.
//     */
//     name: string;

//     /**
//     * The link audience of the shared folder.
//     */
//     audience: DropboxTypes$sharing$LinkAudience;
//   }

//   /**
//   * Arguments for changeFileMemberAccess().
//   */
//   declare interface DropboxTypes$sharing$ChangeFileMemberAccessArgs {
//     /**
//     * File for which we are changing a member's access.
//     */
//     file: DropboxTypes$sharing$PathOrId;

//     /**
//     * The member whose access we are changing.
//     */
//     member: DropboxTypes$sharing$MemberSelector;

//     /**
//     * The new access level for the member.
//     */
//     access_level: DropboxTypes$sharing$AccessLevel;
//   }

//   /**
//   * Metadata for a collection-based shared link.
//   */
//   declare type DropboxTypes$sharing$CollectionLinkMetadata = {
//     ...
//   } & DropboxTypes$sharing$LinkMetadata;

//   /**
//   * Reference to the CollectionLinkMetadata type, identified by the value of
//   * the .tag property.
//   */
//   declare type DropboxTypes$sharing$CollectionLinkMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "collection",
//     ...
//   } & DropboxTypes$sharing$CollectionLinkMetadata;

//   declare interface DropboxTypes$sharing$CreateSharedLinkArg {
//     /**
//     * The path to share.
//     */
//     path: string;

//     /**
//     * Defaults to False.
//     */
//     short_url?: boolean;

//     /**
//     * If it's okay to share a path that does not yet exist, set this to
//     * either PendingUploadMode.file or PendingUploadMode.folder to indicate
//     * whether to assume it's a file or folder.
//     */
//     pending_upload?: DropboxTypes$sharing$PendingUploadMode;
//   }

//   declare interface DropboxTypes$sharing$CreateSharedLinkErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   declare interface DropboxTypes$sharing$CreateSharedLinkErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$CreateSharedLinkError =
//     | DropboxTypes$sharing$CreateSharedLinkErrorPath
//     | DropboxTypes$sharing$CreateSharedLinkErrorOther;

//   declare interface DropboxTypes$sharing$CreateSharedLinkWithSettingsArg {
//     /**
//     * The path to be shared by the shared link.
//     */
//     path: DropboxTypes$sharing$ReadPath;

//     /**
//     * The requested settings for the newly created shared link.
//     */
//     settings?: DropboxTypes$sharing$SharedLinkSettings;
//   }

//   declare interface DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * User's email should be verified.
//   */
//   declare interface DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorEmailNotVerified {
//     ".tag": "email_not_verified";
//   }

//   /**
//   * The shared link already exists. You can call listSharedLinks() to get the
//   * existing link, or use the provided metadata if it is returned.
//   */
//   declare interface DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorSharedLinkAlreadyExists {
//     ".tag": "shared_link_already_exists";
//     shared_link_already_exists: Object;
//   }

//   /**
//   * There is an error with the given settings.
//   */
//   declare interface DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorSettingsError {
//     ".tag": "settings_error";
//     settings_error: DropboxTypes$sharing$SharedLinkSettingsError;
//   }

//   /**
//   * Access to the requested path is forbidden.
//   */
//   declare interface DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorAccessDenied {
//     ".tag": "access_denied";
//   }

//   declare type DropboxTypes$sharing$CreateSharedLinkWithSettingsError =
//     | DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorPath
//     | DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorEmailNotVerified
//     | DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorSharedLinkAlreadyExists
//     | DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorSettingsError
//     | DropboxTypes$sharing$CreateSharedLinkWithSettingsErrorAccessDenied;

//   /**
//   * The expected metadata of a shared link for a file or folder when a link
//   * is first created for the content. Absent if the link already exists.
//   */
//   declare type DropboxTypes$sharing$ExpectedSharedContentLinkMetadata = {
//     ...
//   } & DropboxTypes$sharing$SharedContentLinkMetadataBase;

//   /**
//   * Disable viewer information on the file.
//   */
//   declare interface DropboxTypes$sharing$FileActionDisableViewerInfo {
//     ".tag": "disable_viewer_info";
//   }

//   /**
//   * Change or edit contents of the file.
//   */
//   declare interface DropboxTypes$sharing$FileActionEditContents {
//     ".tag": "edit_contents";
//   }

//   /**
//   * Enable viewer information on the file.
//   */
//   declare interface DropboxTypes$sharing$FileActionEnableViewerInfo {
//     ".tag": "enable_viewer_info";
//   }

//   /**
//   * Add a member with view permissions.
//   */
//   declare interface DropboxTypes$sharing$FileActionInviteViewer {
//     ".tag": "invite_viewer";
//   }

//   /**
//   * Add a member with view permissions but no comment permissions.
//   */
//   declare interface DropboxTypes$sharing$FileActionInviteViewerNoComment {
//     ".tag": "invite_viewer_no_comment";
//   }

//   /**
//   * Add a member with edit permissions.
//   */
//   declare interface DropboxTypes$sharing$FileActionInviteEditor {
//     ".tag": "invite_editor";
//   }

//   /**
//   * Stop sharing this file.
//   */
//   declare interface DropboxTypes$sharing$FileActionUnshare {
//     ".tag": "unshare";
//   }

//   /**
//   * Relinquish one's own membership to the file.
//   */
//   declare interface DropboxTypes$sharing$FileActionRelinquishMembership {
//     ".tag": "relinquish_membership";
//   }

//   /**
//   * Use create_view_link and create_edit_link instead.
//   */
//   declare interface DropboxTypes$sharing$FileActionShareLink {
//     ".tag": "share_link";
//   }

//   /**
//   * Use create_view_link and create_edit_link instead.
//   */
//   declare interface DropboxTypes$sharing$FileActionCreateLink {
//     ".tag": "create_link";
//   }

//   /**
//   * Create a shared link to a file that only allows users to view the
//   * content.
//   */
//   declare interface DropboxTypes$sharing$FileActionCreateViewLink {
//     ".tag": "create_view_link";
//   }

//   /**
//   * Create a shared link to a file that allows users to edit the content.
//   */
//   declare interface DropboxTypes$sharing$FileActionCreateEditLink {
//     ".tag": "create_edit_link";
//   }

//   declare interface DropboxTypes$sharing$FileActionOther {
//     ".tag": "other";
//   }

//   /**
//   * Sharing actions that may be taken on files.
//   */
//   declare type DropboxTypes$sharing$FileAction =
//     | DropboxTypes$sharing$FileActionDisableViewerInfo
//     | DropboxTypes$sharing$FileActionEditContents
//     | DropboxTypes$sharing$FileActionEnableViewerInfo
//     | DropboxTypes$sharing$FileActionInviteViewer
//     | DropboxTypes$sharing$FileActionInviteViewerNoComment
//     | DropboxTypes$sharing$FileActionInviteEditor
//     | DropboxTypes$sharing$FileActionUnshare
//     | DropboxTypes$sharing$FileActionRelinquishMembership
//     | DropboxTypes$sharing$FileActionShareLink
//     | DropboxTypes$sharing$FileActionCreateLink
//     | DropboxTypes$sharing$FileActionCreateViewLink
//     | DropboxTypes$sharing$FileActionCreateEditLink
//     | DropboxTypes$sharing$FileActionOther;

//   /**
//   * File specified by id was not found.
//   */
//   declare interface DropboxTypes$sharing$FileErrorResultFileNotFoundError {
//     ".tag": "file_not_found_error";
//     file_not_found_error: DropboxTypes$files$Id;
//   }

//   /**
//   * User does not have permission to take the specified action on the file.
//   */
//   declare interface DropboxTypes$sharing$FileErrorResultInvalidFileActionError {
//     ".tag": "invalid_file_action_error";
//     invalid_file_action_error: DropboxTypes$files$Id;
//   }

//   /**
//   * User does not have permission to access file specified by file.Id.
//   */
//   declare interface DropboxTypes$sharing$FileErrorResultPermissionDeniedError {
//     ".tag": "permission_denied_error";
//     permission_denied_error: DropboxTypes$files$Id;
//   }

//   declare interface DropboxTypes$sharing$FileErrorResultOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$FileErrorResult =
//     | DropboxTypes$sharing$FileErrorResultFileNotFoundError
//     | DropboxTypes$sharing$FileErrorResultInvalidFileActionError
//     | DropboxTypes$sharing$FileErrorResultPermissionDeniedError
//     | DropboxTypes$sharing$FileErrorResultOther;

//   /**
//   * The metadata of a file shared link.
//   */
//   declare type DropboxTypes$sharing$FileLinkMetadata = {
//     /**
//     * The modification time set by the desktop client when the file was added
//     * to Dropbox. Since this time is not verified (the Dropbox server stores
//     * whatever the desktop client sends up), this should only be used for
//     * display purposes (such as sorting) and not, for example, to determine
//     * if a file has changed or not.
//     */
//     client_modified: DropboxTypes$common$DropboxTimestamp,

//     /**
//     * The last time the file was modified on Dropbox.
//     */
//     server_modified: DropboxTypes$common$DropboxTimestamp,

//     /**
//     * A unique identifier for the current revision of a file. This field is
//     * the same rev as elsewhere in the API and can be used to detect changes
//     * and avoid conflicts.
//     */
//     rev: DropboxTypes$sharing$Rev,

//     /**
//     * The file size in bytes.
//     */
//     size: number,
//     ...
//   } & DropboxTypes$sharing$SharedLinkMetadata;

//   /**
//   * Reference to the FileLinkMetadata type, identified by the value of the
//   * .tag property.
//   */
//   declare type DropboxTypes$sharing$FileLinkMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "file",
//     ...
//   } & DropboxTypes$sharing$FileLinkMetadata;

//   /**
//   * Specified member was not found.
//   */
//   declare interface DropboxTypes$sharing$FileMemberActionErrorInvalidMember {
//     ".tag": "invalid_member";
//   }

//   /**
//   * User does not have permission to perform this action on this member.
//   */
//   declare interface DropboxTypes$sharing$FileMemberActionErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * Specified file was invalid or user does not have access.
//   */
//   declare interface DropboxTypes$sharing$FileMemberActionErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   /**
//   * The action cannot be completed because the target member does not have
//   * explicit access to the file. The return value is the access that the
//   * member has to the file from a parent folder.
//   */
//   declare type DropboxTypes$sharing$FileMemberActionErrorNoExplicitAccess = {
//     ".tag": "no_explicit_access",
//     ...
//   } & DropboxTypes$sharing$MemberAccessLevelResult;

//   declare interface DropboxTypes$sharing$FileMemberActionErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$FileMemberActionError =
//     | DropboxTypes$sharing$FileMemberActionErrorInvalidMember
//     | DropboxTypes$sharing$FileMemberActionErrorNoPermission
//     | DropboxTypes$sharing$FileMemberActionErrorAccessError
//     | DropboxTypes$sharing$FileMemberActionErrorNoExplicitAccess
//     | DropboxTypes$sharing$FileMemberActionErrorOther;

//   /**
//   * Member was successfully removed from this file. If AccessLevel is given,
//   * the member still has access via a parent shared folder.
//   */
//   declare interface DropboxTypes$sharing$FileMemberActionIndividualResultSuccess {
//     ".tag": "success";
//     success: Object;
//   }

//   /**
//   * User was not able to perform this action.
//   */
//   declare interface DropboxTypes$sharing$FileMemberActionIndividualResultMemberError {
//     ".tag": "member_error";
//     member_error: DropboxTypes$sharing$FileMemberActionError;
//   }

//   declare type DropboxTypes$sharing$FileMemberActionIndividualResult =
//     | DropboxTypes$sharing$FileMemberActionIndividualResultSuccess
//     | DropboxTypes$sharing$FileMemberActionIndividualResultMemberError;

//   /**
//   * Per-member result for addFileMember() or changeFileMemberAccess().
//   */
//   declare interface DropboxTypes$sharing$FileMemberActionResult {
//     /**
//     * One of specified input members.
//     */
//     member: DropboxTypes$sharing$MemberSelector;

//     /**
//     * The outcome of the action on this member.
//     */
//     result: DropboxTypes$sharing$FileMemberActionIndividualResult;
//   }

//   /**
//   * Member was successfully removed from this file.
//   */
//   declare type DropboxTypes$sharing$FileMemberRemoveActionResultSuccess = {
//     ".tag": "success",
//     ...
//   } & DropboxTypes$sharing$MemberAccessLevelResult;

//   /**
//   * User was not able to remove this member.
//   */
//   declare interface DropboxTypes$sharing$FileMemberRemoveActionResultMemberError {
//     ".tag": "member_error";
//     member_error: DropboxTypes$sharing$FileMemberActionError;
//   }

//   declare interface DropboxTypes$sharing$FileMemberRemoveActionResultOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$FileMemberRemoveActionResult =
//     | DropboxTypes$sharing$FileMemberRemoveActionResultSuccess
//     | DropboxTypes$sharing$FileMemberRemoveActionResultMemberError
//     | DropboxTypes$sharing$FileMemberRemoveActionResultOther;

//   /**
//   * Whether the user is allowed to take the sharing action on the file.
//   */
//   declare interface DropboxTypes$sharing$FilePermission {
//     /**
//     * The action that the user may wish to take on the file.
//     */
//     action: DropboxTypes$sharing$FileAction;

//     /**
//     * True if the user is allowed to take the action.
//     */
//     allow: boolean;

//     /**
//     * The reason why the user is denied the permission. Not present if the
//     * action is allowed.
//     */
//     reason?: DropboxTypes$sharing$PermissionDeniedReason;
//   }

//   /**
//   * Change folder options, such as who can be invited to join the folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionChangeOptions {
//     ".tag": "change_options";
//   }

//   /**
//   * Disable viewer information for this folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionDisableViewerInfo {
//     ".tag": "disable_viewer_info";
//   }

//   /**
//   * Change or edit contents of the folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionEditContents {
//     ".tag": "edit_contents";
//   }

//   /**
//   * Enable viewer information on the folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionEnableViewerInfo {
//     ".tag": "enable_viewer_info";
//   }

//   /**
//   * Invite a user or group to join the folder with read and write permission.
//   */
//   declare interface DropboxTypes$sharing$FolderActionInviteEditor {
//     ".tag": "invite_editor";
//   }

//   /**
//   * Invite a user or group to join the folder with read permission.
//   */
//   declare interface DropboxTypes$sharing$FolderActionInviteViewer {
//     ".tag": "invite_viewer";
//   }

//   /**
//   * Invite a user or group to join the folder with read permission but no
//   * comment permissions.
//   */
//   declare interface DropboxTypes$sharing$FolderActionInviteViewerNoComment {
//     ".tag": "invite_viewer_no_comment";
//   }

//   /**
//   * Relinquish one's own membership in the folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionRelinquishMembership {
//     ".tag": "relinquish_membership";
//   }

//   /**
//   * Unmount the folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionUnmount {
//     ".tag": "unmount";
//   }

//   /**
//   * Stop sharing this folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionUnshare {
//     ".tag": "unshare";
//   }

//   /**
//   * Keep a copy of the contents upon leaving or being kicked from the folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionLeaveACopy {
//     ".tag": "leave_a_copy";
//   }

//   /**
//   * Use create_link instead.
//   */
//   declare interface DropboxTypes$sharing$FolderActionShareLink {
//     ".tag": "share_link";
//   }

//   /**
//   * Create a shared link for folder.
//   */
//   declare interface DropboxTypes$sharing$FolderActionCreateLink {
//     ".tag": "create_link";
//   }

//   /**
//   * Set whether the folder inherits permissions from its parent.
//   */
//   declare interface DropboxTypes$sharing$FolderActionSetAccessInheritance {
//     ".tag": "set_access_inheritance";
//   }

//   declare interface DropboxTypes$sharing$FolderActionOther {
//     ".tag": "other";
//   }

//   /**
//   * Actions that may be taken on shared folders.
//   */
//   declare type DropboxTypes$sharing$FolderAction =
//     | DropboxTypes$sharing$FolderActionChangeOptions
//     | DropboxTypes$sharing$FolderActionDisableViewerInfo
//     | DropboxTypes$sharing$FolderActionEditContents
//     | DropboxTypes$sharing$FolderActionEnableViewerInfo
//     | DropboxTypes$sharing$FolderActionInviteEditor
//     | DropboxTypes$sharing$FolderActionInviteViewer
//     | DropboxTypes$sharing$FolderActionInviteViewerNoComment
//     | DropboxTypes$sharing$FolderActionRelinquishMembership
//     | DropboxTypes$sharing$FolderActionUnmount
//     | DropboxTypes$sharing$FolderActionUnshare
//     | DropboxTypes$sharing$FolderActionLeaveACopy
//     | DropboxTypes$sharing$FolderActionShareLink
//     | DropboxTypes$sharing$FolderActionCreateLink
//     | DropboxTypes$sharing$FolderActionSetAccessInheritance
//     | DropboxTypes$sharing$FolderActionOther;

//   /**
//   * The metadata of a folder shared link.
//   */
//   declare type DropboxTypes$sharing$FolderLinkMetadata = {
//     ...
//   } & DropboxTypes$sharing$SharedLinkMetadata;

//   /**
//   * Reference to the FolderLinkMetadata type, identified by the value of the
//   * .tag property.
//   */
//   declare type DropboxTypes$sharing$FolderLinkMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "folder",
//     ...
//   } & DropboxTypes$sharing$FolderLinkMetadata;

//   /**
//   * Whether the user is allowed to take the action on the shared folder.
//   */
//   declare interface DropboxTypes$sharing$FolderPermission {
//     /**
//     * The action that the user may wish to take on the folder.
//     */
//     action: DropboxTypes$sharing$FolderAction;

//     /**
//     * True if the user is allowed to take the action.
//     */
//     allow: boolean;

//     /**
//     * The reason why the user is denied the permission. Not present if the
//     * action is allowed, or if no reason is available.
//     */
//     reason?: DropboxTypes$sharing$PermissionDeniedReason;
//   }

//   /**
//   * A set of policies governing membership and privileges for a shared
//   * folder.
//   */
//   declare interface DropboxTypes$sharing$FolderPolicy {
//     /**
//     * Who can be a member of this shared folder, as set on the folder itself.
//     * The effective policy may differ from this value if the team-wide policy
//     * is more restrictive. Present only if the folder is owned by a team.
//     */
//     member_policy?: DropboxTypes$sharing$MemberPolicy;

//     /**
//     * Who can be a member of this shared folder, taking into account both the
//     * folder and the team-wide policy. This value may differ from that of
//     * member_policy if the team-wide policy is more restrictive than the
//     * folder policy. Present only if the folder is owned by a team.
//     */
//     resolved_member_policy?: DropboxTypes$sharing$MemberPolicy;

//     /**
//     * Who can add and remove members from this shared folder.
//     */
//     acl_update_policy: DropboxTypes$sharing$AclUpdatePolicy;

//     /**
//     * Who links can be shared with.
//     */
//     shared_link_policy: DropboxTypes$sharing$SharedLinkPolicy;

//     /**
//     * Who can enable/disable viewer info for this shared folder.
//     */
//     viewer_info_policy?: DropboxTypes$sharing$ViewerInfoPolicy;
//   }

//   /**
//   * Arguments of getFileMetadata().
//   */
//   declare interface DropboxTypes$sharing$GetFileMetadataArg {
//     /**
//     * The file to query.
//     */
//     file: DropboxTypes$sharing$PathOrId;

//     /**
//     * A list of `FileAction`s corresponding to `FilePermission`s that should
//     * appear in the  response's SharedFileMetadata.permissions field
//     * describing the actions the  authenticated user can perform on the file.
//     */
//     actions?: Array<DropboxTypes$sharing$FileAction>;
//   }

//   /**
//   * Arguments of getFileMetadataBatch().
//   */
//   declare interface DropboxTypes$sharing$GetFileMetadataBatchArg {
//     /**
//     * The files to query.
//     */
//     files: Array<DropboxTypes$sharing$PathOrId>;

//     /**
//     * A list of `FileAction`s corresponding to `FilePermission`s that should
//     * appear in the  response's SharedFileMetadata.permissions field
//     * describing the actions the  authenticated user can perform on the file.
//     */
//     actions?: Array<DropboxTypes$sharing$FileAction>;
//   }

//   /**
//   * Per file results of getFileMetadataBatch().
//   */
//   declare interface DropboxTypes$sharing$GetFileMetadataBatchResult {
//     /**
//     * This is the input file identifier corresponding to one of
//     * GetFileMetadataBatchArg.files.
//     */
//     file: DropboxTypes$sharing$PathOrId;

//     /**
//     * The result for this particular file.
//     */
//     result: DropboxTypes$sharing$GetFileMetadataIndividualResult;
//   }

//   declare interface DropboxTypes$sharing$GetFileMetadataErrorUserError {
//     ".tag": "user_error";
//     user_error: DropboxTypes$sharing$SharingUserError;
//   }

//   declare interface DropboxTypes$sharing$GetFileMetadataErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   declare interface DropboxTypes$sharing$GetFileMetadataErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error result for getFileMetadata().
//   */
//   declare type DropboxTypes$sharing$GetFileMetadataError =
//     | DropboxTypes$sharing$GetFileMetadataErrorUserError
//     | DropboxTypes$sharing$GetFileMetadataErrorAccessError
//     | DropboxTypes$sharing$GetFileMetadataErrorOther;

//   /**
//   * The result for this file if it was successful.
//   */
//   declare type DropboxTypes$sharing$GetFileMetadataIndividualResultMetadata = {
//     ".tag": "metadata",
//     ...
//   } & DropboxTypes$sharing$SharedFileMetadata;

//   /**
//   * The result for this file if it was an error.
//   */
//   declare interface DropboxTypes$sharing$GetFileMetadataIndividualResultAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   declare interface DropboxTypes$sharing$GetFileMetadataIndividualResultOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$GetFileMetadataIndividualResult =
//     | DropboxTypes$sharing$GetFileMetadataIndividualResultMetadata
//     | DropboxTypes$sharing$GetFileMetadataIndividualResultAccessError
//     | DropboxTypes$sharing$GetFileMetadataIndividualResultOther;

//   declare interface DropboxTypes$sharing$GetMetadataArgs {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * A list of `FolderAction`s corresponding to `FolderPermission`s that
//     * should appear in the  response's SharedFolderMetadata.permissions field
//     * describing the actions the  authenticated user can perform on the
//     * folder.
//     */
//     actions?: Array<DropboxTypes$sharing$FolderAction>;
//   }

//   /**
//   * Directories cannot be retrieved by this endpoint.
//   */
//   declare interface DropboxTypes$sharing$GetSharedLinkFileErrorSharedLinkIsDirectory {
//     ".tag": "shared_link_is_directory";
//   }

//   declare type DropboxTypes$sharing$GetSharedLinkFileError =
//     | DropboxTypes$sharing$SharedLinkError
//     | DropboxTypes$sharing$GetSharedLinkFileErrorSharedLinkIsDirectory;

//   declare interface DropboxTypes$sharing$GetSharedLinkMetadataArg {
//     /**
//     * URL of the shared link.
//     */
//     url: string;

//     /**
//     * If the shared link is to a folder, this parameter can be used to
//     * retrieve the metadata for a specific file or sub-folder in this folder.
//     * A relative path should be used.
//     */
//     path?: DropboxTypes$sharing$Path;

//     /**
//     * If the shared link has a password, this parameter can be used.
//     */
//     link_password?: string;
//   }

//   declare interface DropboxTypes$sharing$GetSharedLinksArg {
//     /**
//     * See getSharedLinks() description.
//     */
//     path?: string;
//   }

//   declare interface DropboxTypes$sharing$GetSharedLinksErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$MalformedPathError;
//   }

//   declare interface DropboxTypes$sharing$GetSharedLinksErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$GetSharedLinksError =
//     | DropboxTypes$sharing$GetSharedLinksErrorPath
//     | DropboxTypes$sharing$GetSharedLinksErrorOther;

//   declare interface DropboxTypes$sharing$GetSharedLinksResult {
//     /**
//     * Shared links applicable to the path argument.
//     */
//     links: Array<
//       | DropboxTypes$sharing$PathLinkMetadataReference
//       | DropboxTypes$sharing$CollectionLinkMetadataReference
//       | DropboxTypes$sharing$LinkMetadataReference
//     >;
//   }

//   /**
//   * The information about a group. Groups is a way to manage a list of users
//   * who need same access permission to the shared folder.
//   */
//   declare type DropboxTypes$sharing$GroupInfo = {
//     /**
//     * The type of group.
//     */
//     group_type: DropboxTypes$team_common$GroupType,

//     /**
//     * If the current user is a member of the group.
//     */
//     is_member: boolean,

//     /**
//     * If the current user is an owner of the group.
//     */
//     is_owner: boolean,

//     /**
//     * If the group is owned by the current user's team.
//     */
//     same_team: boolean,
//     ...
//   } & DropboxTypes$team_common$GroupSummary;

//   /**
//   * The information about a group member of the shared content.
//   */
//   declare type DropboxTypes$sharing$GroupMembershipInfo = {
//     /**
//     * The information about the membership group.
//     */
//     group: DropboxTypes$sharing$GroupInfo,
//     ...
//   } & DropboxTypes$sharing$MembershipInfo;

//   declare interface DropboxTypes$sharing$InsufficientPlan {
//     /**
//     * A message to tell the user to upgrade in order to support expected
//     * action.
//     */
//     message: string;

//     /**
//     * A URL to send the user to in order to obtain the account type they
//     * need, e.g. upgrading. Absent if there is no action the user can take to
//     * upgrade.
//     */
//     upsell_url?: string;
//   }

//   declare interface DropboxTypes$sharing$InsufficientQuotaAmounts {
//     /**
//     * The amount of space needed to add the item (the size of the item).
//     */
//     space_needed: number;

//     /**
//     * The amount of extra space needed to add the item.
//     */
//     space_shortage: number;

//     /**
//     * The amount of space left in the user's Dropbox, less than space_needed.
//     */
//     space_left: number;
//   }

//   /**
//   * E-mail address of invited user.
//   */
//   declare interface DropboxTypes$sharing$InviteeInfoEmail {
//     ".tag": "email";
//     email: DropboxTypes$common$EmailAddress;
//   }

//   declare interface DropboxTypes$sharing$InviteeInfoOther {
//     ".tag": "other";
//   }

//   /**
//   * Information about the recipient of a shared content invitation.
//   */
//   declare type DropboxTypes$sharing$InviteeInfo =
//     | DropboxTypes$sharing$InviteeInfoEmail
//     | DropboxTypes$sharing$InviteeInfoOther;

//   /**
//   * Information about an invited member of a shared content.
//   */
//   declare type DropboxTypes$sharing$InviteeMembershipInfo = {
//     /**
//     * Recipient of the invitation.
//     */
//     invitee: DropboxTypes$sharing$InviteeInfo,

//     /**
//     * The user this invitation is tied to, if available.
//     */
//     user?: DropboxTypes$sharing$UserInfo,
//     ...
//   } & DropboxTypes$sharing$MembershipInfo;

//   /**
//   * Error occurred while performing unshareFolder() action.
//   */
//   declare interface DropboxTypes$sharing$JobErrorUnshareFolderError {
//     ".tag": "unshare_folder_error";
//     unshare_folder_error: DropboxTypes$sharing$UnshareFolderError;
//   }

//   /**
//   * Error occurred while performing removeFolderMember() action.
//   */
//   declare interface DropboxTypes$sharing$JobErrorRemoveFolderMemberError {
//     ".tag": "remove_folder_member_error";
//     remove_folder_member_error: DropboxTypes$sharing$RemoveFolderMemberError;
//   }

//   /**
//   * Error occurred while performing relinquishFolderMembership() action.
//   */
//   declare interface DropboxTypes$sharing$JobErrorRelinquishFolderMembershipError {
//     ".tag": "relinquish_folder_membership_error";
//     relinquish_folder_membership_error: DropboxTypes$sharing$RelinquishFolderMembershipError;
//   }

//   declare interface DropboxTypes$sharing$JobErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error occurred while performing an asynchronous job from unshareFolder()
//   * or removeFolderMember().
//   */
//   declare type DropboxTypes$sharing$JobError =
//     | DropboxTypes$sharing$JobErrorUnshareFolderError
//     | DropboxTypes$sharing$JobErrorRemoveFolderMemberError
//     | DropboxTypes$sharing$JobErrorRelinquishFolderMembershipError
//     | DropboxTypes$sharing$JobErrorOther;

//   /**
//   * The asynchronous job has finished.
//   */
//   declare interface DropboxTypes$sharing$JobStatusComplete {
//     ".tag": "complete";
//   }

//   /**
//   * The asynchronous job returned an error.
//   */
//   declare interface DropboxTypes$sharing$JobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$sharing$JobError;
//   }

//   declare type DropboxTypes$sharing$JobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$sharing$JobStatusComplete
//     | DropboxTypes$sharing$JobStatusFailed;

//   /**
//   * Users who use the link can view and comment on the content.
//   */
//   declare interface DropboxTypes$sharing$LinkAccessLevelViewer {
//     ".tag": "viewer";
//   }

//   /**
//   * Users who use the link can edit, view and comment on the content.
//   */
//   declare interface DropboxTypes$sharing$LinkAccessLevelEditor {
//     ".tag": "editor";
//   }

//   declare interface DropboxTypes$sharing$LinkAccessLevelOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$LinkAccessLevel =
//     | DropboxTypes$sharing$LinkAccessLevelViewer
//     | DropboxTypes$sharing$LinkAccessLevelEditor
//     | DropboxTypes$sharing$LinkAccessLevelOther;

//   /**
//   * Change the access level of the link.
//   */
//   declare interface DropboxTypes$sharing$LinkActionChangeAccessLevel {
//     ".tag": "change_access_level";
//   }

//   /**
//   * Change the audience of the link.
//   */
//   declare interface DropboxTypes$sharing$LinkActionChangeAudience {
//     ".tag": "change_audience";
//   }

//   /**
//   * Remove the expiry date of the link.
//   */
//   declare interface DropboxTypes$sharing$LinkActionRemoveExpiry {
//     ".tag": "remove_expiry";
//   }

//   /**
//   * Remove the password of the link.
//   */
//   declare interface DropboxTypes$sharing$LinkActionRemovePassword {
//     ".tag": "remove_password";
//   }

//   /**
//   * Create or modify the expiry date of the link.
//   */
//   declare interface DropboxTypes$sharing$LinkActionSetExpiry {
//     ".tag": "set_expiry";
//   }

//   /**
//   * Create or modify the password of the link.
//   */
//   declare interface DropboxTypes$sharing$LinkActionSetPassword {
//     ".tag": "set_password";
//   }

//   declare interface DropboxTypes$sharing$LinkActionOther {
//     ".tag": "other";
//   }

//   /**
//   * Actions that can be performed on a link.
//   */
//   declare type DropboxTypes$sharing$LinkAction =
//     | DropboxTypes$sharing$LinkActionChangeAccessLevel
//     | DropboxTypes$sharing$LinkActionChangeAudience
//     | DropboxTypes$sharing$LinkActionRemoveExpiry
//     | DropboxTypes$sharing$LinkActionRemovePassword
//     | DropboxTypes$sharing$LinkActionSetExpiry
//     | DropboxTypes$sharing$LinkActionSetPassword
//     | DropboxTypes$sharing$LinkActionOther;

//   /**
//   * Link is accessible by anyone.
//   */
//   declare interface DropboxTypes$sharing$LinkAudiencePublic {
//     ".tag": "public";
//   }

//   /**
//   * Link is accessible only by team members.
//   */
//   declare interface DropboxTypes$sharing$LinkAudienceTeam {
//     ".tag": "team";
//   }

//   /**
//   * The link can be used by no one. The link merely points the user to the
//   * content, and does not grant additional rights to the user. Members of the
//   * content who use this link can only access the content with their
//   * pre-existing access rights.
//   */
//   declare interface DropboxTypes$sharing$LinkAudienceNoOne {
//     ".tag": "no_one";
//   }

//   /**
//   * A link-specific password is required to access the link. Login is not
//   * required.
//   */
//   declare interface DropboxTypes$sharing$LinkAudiencePassword {
//     ".tag": "password";
//   }

//   /**
//   * Link is accessible only by members of the content.
//   */
//   declare interface DropboxTypes$sharing$LinkAudienceMembers {
//     ".tag": "members";
//   }

//   declare interface DropboxTypes$sharing$LinkAudienceOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$LinkAudience =
//     | DropboxTypes$sharing$LinkAudiencePublic
//     | DropboxTypes$sharing$LinkAudienceTeam
//     | DropboxTypes$sharing$LinkAudienceNoOne
//     | DropboxTypes$sharing$LinkAudiencePassword
//     | DropboxTypes$sharing$LinkAudienceMembers
//     | DropboxTypes$sharing$LinkAudienceOther;

//   /**
//   * Remove the currently set expiry for the link.
//   */
//   declare interface DropboxTypes$sharing$LinkExpiryRemoveExpiry {
//     ".tag": "remove_expiry";
//   }

//   /**
//   * Set a new expiry or change an existing expiry.
//   */
//   declare interface DropboxTypes$sharing$LinkExpirySetExpiry {
//     ".tag": "set_expiry";
//     set_expiry: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$sharing$LinkExpiryOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$LinkExpiry =
//     | DropboxTypes$sharing$LinkExpiryRemoveExpiry
//     | DropboxTypes$sharing$LinkExpirySetExpiry
//     | DropboxTypes$sharing$LinkExpiryOther;

//   /**
//   * Metadata for a shared link. This can be either a sharing.PathLinkMetadata
//   * or sharing.CollectionLinkMetadata.
//   */
//   declare interface DropboxTypes$sharing$LinkMetadata {
//     /**
//     * URL of the shared link.
//     */
//     url: string;

//     /**
//     * Who can access the link.
//     */
//     visibility: DropboxTypes$sharing$Visibility;

//     /**
//     * Expiration time, if set. By default the link won't expire.
//     */
//     expires?: DropboxTypes$common$DropboxTimestamp;
//   }

//   /**
//   * Reference to the LinkMetadata polymorphic type. Contains a .tag property
//   * to let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$sharing$LinkMetadataReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "path" | "collection",
//     ...
//   } & DropboxTypes$sharing$LinkMetadata;

//   /**
//   * Remove the currently set password for the link.
//   */
//   declare interface DropboxTypes$sharing$LinkPasswordRemovePassword {
//     ".tag": "remove_password";
//   }

//   /**
//   * Set a new password or change an existing password.
//   */
//   declare interface DropboxTypes$sharing$LinkPasswordSetPassword {
//     ".tag": "set_password";
//     set_password: string;
//   }

//   declare interface DropboxTypes$sharing$LinkPasswordOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$LinkPassword =
//     | DropboxTypes$sharing$LinkPasswordRemovePassword
//     | DropboxTypes$sharing$LinkPasswordSetPassword
//     | DropboxTypes$sharing$LinkPasswordOther;

//   /**
//   * Permissions for actions that can be performed on a link.
//   */
//   declare interface DropboxTypes$sharing$LinkPermission {
//     action: DropboxTypes$sharing$LinkAction;
//     allow: boolean;
//     reason?: DropboxTypes$sharing$PermissionDeniedReason;
//   }

//   declare interface DropboxTypes$sharing$LinkPermissions {
//     /**
//     * The current visibility of the link after considering the shared links
//     * policies of the the team (in case the link's owner is part of a team)
//     * and the shared folder (in case the linked file is part of a shared
//     * folder). This field is shown only if the caller has access to this info
//     * (the link's owner always has access to this data). For some links, an
//     * effective_audience value is returned instead.
//     */
//     resolved_visibility?: DropboxTypes$sharing$ResolvedVisibility;

//     /**
//     * The shared link's requested visibility. This can be overridden by the
//     * team and shared folder policies. The final visibility, after
//     * considering these policies, can be found in resolved_visibility. This
//     * is shown only if the caller is the link's owner and resolved_visibility
//     * is returned instead of effective_audience.
//     */
//     requested_visibility?: DropboxTypes$sharing$RequestedVisibility;

//     /**
//     * Whether the caller can revoke the shared link.
//     */
//     can_revoke: boolean;

//     /**
//     * The failure reason for revoking the link. This field will only be
//     * present if the can_revoke is false.
//     */
//     revoke_failure_reason?: DropboxTypes$sharing$SharedLinkAccessFailureReason;

//     /**
//     * The type of audience who can benefit from the access level specified by
//     * the `link_access_level` field.
//     */
//     effective_audience?: DropboxTypes$sharing$LinkAudience;

//     /**
//     * The access level that the link will grant to its users. A link can
//     * grant additional rights to a user beyond their current access level.
//     * For example, if a user was invited as a viewer to a file, and then
//     * opens a link with `link_access_level` set to `editor`, then they will
//     * gain editor privileges. The `link_access_level` is a property of the
//     * link, and does not depend on who is calling this API. In particular,
//     * `link_access_level` does not take into account the API caller's current
//     * permissions to the content.
//     */
//     link_access_level?: DropboxTypes$sharing$LinkAccessLevel;
//   }

//   /**
//   * Settings that apply to a link.
//   */
//   declare interface DropboxTypes$sharing$LinkSettings {
//     /**
//     * The access level on the link for this file. Currently, it only accepts
//     * 'viewer' and 'viewer_no_comment'.
//     */
//     access_level?: DropboxTypes$sharing$AccessLevel;

//     /**
//     * The type of audience on the link for this file.
//     */
//     audience?: DropboxTypes$sharing$LinkAudience;

//     /**
//     * An expiry timestamp to set on a link.
//     */
//     expiry?: DropboxTypes$sharing$LinkExpiry;

//     /**
//     * The password for the link.
//     */
//     password?: DropboxTypes$sharing$LinkPassword;
//   }

//   /**
//   * Arguments for listFileMembers().
//   */
//   declare interface DropboxTypes$sharing$ListFileMembersArg {
//     /**
//     * The file for which you want to see members.
//     */
//     file: DropboxTypes$sharing$PathOrId;

//     /**
//     * The actions for which to return permissions on a member.
//     */
//     actions?: Array<DropboxTypes$sharing$MemberAction>;

//     /**
//     * Defaults to True.
//     */
//     include_inherited?: boolean;

//     /**
//     * Defaults to 100.
//     */
//     limit?: number;
//   }

//   /**
//   * Arguments for listFileMembersBatch().
//   */
//   declare interface DropboxTypes$sharing$ListFileMembersBatchArg {
//     /**
//     * Files for which to return members.
//     */
//     files: Array<DropboxTypes$sharing$PathOrId>;

//     /**
//     * Defaults to 10.
//     */
//     limit?: number;
//   }

//   /**
//   * Per-file result for listFileMembersBatch().
//   */
//   declare interface DropboxTypes$sharing$ListFileMembersBatchResult {
//     /**
//     * This is the input file identifier, whether an ID or a path.
//     */
//     file: DropboxTypes$sharing$PathOrId;

//     /**
//     * The result for this particular file.
//     */
//     result: DropboxTypes$sharing$ListFileMembersIndividualResult;
//   }

//   /**
//   * Arguments for listFileMembersContinue().
//   */
//   declare interface DropboxTypes$sharing$ListFileMembersContinueArg {
//     /**
//     * The cursor returned by your last call to listFileMembers(),
//     * listFileMembersContinue(), or listFileMembersBatch().
//     */
//     cursor: string;
//   }

//   declare interface DropboxTypes$sharing$ListFileMembersContinueErrorUserError {
//     ".tag": "user_error";
//     user_error: DropboxTypes$sharing$SharingUserError;
//   }

//   declare interface DropboxTypes$sharing$ListFileMembersContinueErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   /**
//   * ListFileMembersContinueArg.cursor is invalid.
//   */
//   declare interface DropboxTypes$sharing$ListFileMembersContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$sharing$ListFileMembersContinueErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error for listFileMembersContinue().
//   */
//   declare type DropboxTypes$sharing$ListFileMembersContinueError =
//     | DropboxTypes$sharing$ListFileMembersContinueErrorUserError
//     | DropboxTypes$sharing$ListFileMembersContinueErrorAccessError
//     | DropboxTypes$sharing$ListFileMembersContinueErrorInvalidCursor
//     | DropboxTypes$sharing$ListFileMembersContinueErrorOther;

//   declare interface DropboxTypes$sharing$ListFileMembersCountResult {
//     /**
//     * A list of members on this file.
//     */
//     members: DropboxTypes$sharing$SharedFileMembers;

//     /**
//     * The number of members on this file. This does not include inherited
//     * members.
//     */
//     member_count: number;
//   }

//   declare interface DropboxTypes$sharing$ListFileMembersErrorUserError {
//     ".tag": "user_error";
//     user_error: DropboxTypes$sharing$SharingUserError;
//   }

//   declare interface DropboxTypes$sharing$ListFileMembersErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   declare interface DropboxTypes$sharing$ListFileMembersErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error for listFileMembers().
//   */
//   declare type DropboxTypes$sharing$ListFileMembersError =
//     | DropboxTypes$sharing$ListFileMembersErrorUserError
//     | DropboxTypes$sharing$ListFileMembersErrorAccessError
//     | DropboxTypes$sharing$ListFileMembersErrorOther;

//   /**
//   * The results of the query for this file if it was successful.
//   */
//   declare type DropboxTypes$sharing$ListFileMembersIndividualResultResult = {
//     ".tag": "result",
//     ...
//   } & DropboxTypes$sharing$ListFileMembersCountResult;

//   /**
//   * The result of the query for this file if it was an error.
//   */
//   declare interface DropboxTypes$sharing$ListFileMembersIndividualResultAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   declare interface DropboxTypes$sharing$ListFileMembersIndividualResultOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$ListFileMembersIndividualResult =
//     | DropboxTypes$sharing$ListFileMembersIndividualResultResult
//     | DropboxTypes$sharing$ListFileMembersIndividualResultAccessError
//     | DropboxTypes$sharing$ListFileMembersIndividualResultOther;

//   /**
//   * Arguments for listReceivedFiles().
//   */
//   declare interface DropboxTypes$sharing$ListFilesArg {
//     /**
//     * Defaults to 100.
//     */
//     limit?: number;

//     /**
//     * A list of `FileAction`s corresponding to `FilePermission`s that should
//     * appear in the  response's SharedFileMetadata.permissions field
//     * describing the actions the  authenticated user can perform on the file.
//     */
//     actions?: Array<DropboxTypes$sharing$FileAction>;
//   }

//   /**
//   * Arguments for listReceivedFilesContinue().
//   */
//   declare interface DropboxTypes$sharing$ListFilesContinueArg {
//     /**
//     * Cursor in ListFilesResult.cursor.
//     */
//     cursor: string;
//   }

//   /**
//   * User account had a problem.
//   */
//   declare interface DropboxTypes$sharing$ListFilesContinueErrorUserError {
//     ".tag": "user_error";
//     user_error: DropboxTypes$sharing$SharingUserError;
//   }

//   /**
//   * ListFilesContinueArg.cursor is invalid.
//   */
//   declare interface DropboxTypes$sharing$ListFilesContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$sharing$ListFilesContinueErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error results for listReceivedFilesContinue().
//   */
//   declare type DropboxTypes$sharing$ListFilesContinueError =
//     | DropboxTypes$sharing$ListFilesContinueErrorUserError
//     | DropboxTypes$sharing$ListFilesContinueErrorInvalidCursor
//     | DropboxTypes$sharing$ListFilesContinueErrorOther;

//   /**
//   * Success results for listReceivedFiles().
//   */
//   declare interface DropboxTypes$sharing$ListFilesResult {
//     /**
//     * Information about the files shared with current user.
//     */
//     entries: Array<DropboxTypes$sharing$SharedFileMetadata>;

//     /**
//     * Cursor used to obtain additional shared files.
//     */
//     cursor?: string;
//   }

//   declare type DropboxTypes$sharing$ListFolderMembersArgs = {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId,
//     ...
//   } & DropboxTypes$sharing$ListFolderMembersCursorArg;

//   declare interface DropboxTypes$sharing$ListFolderMembersContinueArg {
//     /**
//     * The cursor returned by your last call to listFolderMembers() or
//     * listFolderMembersContinue().
//     */
//     cursor: string;
//   }

//   declare interface DropboxTypes$sharing$ListFolderMembersContinueErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * ListFolderMembersContinueArg.cursor is invalid.
//   */
//   declare interface DropboxTypes$sharing$ListFolderMembersContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$sharing$ListFolderMembersContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$ListFolderMembersContinueError =
//     | DropboxTypes$sharing$ListFolderMembersContinueErrorAccessError
//     | DropboxTypes$sharing$ListFolderMembersContinueErrorInvalidCursor
//     | DropboxTypes$sharing$ListFolderMembersContinueErrorOther;

//   declare interface DropboxTypes$sharing$ListFolderMembersCursorArg {
//     /**
//     * This is a list indicating whether each returned member will include a
//     * boolean value MemberPermission.allow that describes whether the current
//     * user can perform the MemberAction on the member.
//     */
//     actions?: Array<DropboxTypes$sharing$MemberAction>;

//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$sharing$ListFoldersArgs {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;

//     /**
//     * A list of `FolderAction`s corresponding to `FolderPermission`s that
//     * should appear in the  response's SharedFolderMetadata.permissions field
//     * describing the actions the  authenticated user can perform on the
//     * folder.
//     */
//     actions?: Array<DropboxTypes$sharing$FolderAction>;
//   }

//   declare interface DropboxTypes$sharing$ListFoldersContinueArg {
//     /**
//     * The cursor returned by the previous API call specified in the endpoint
//     * description.
//     */
//     cursor: string;
//   }

//   /**
//   * ListFoldersContinueArg.cursor is invalid.
//   */
//   declare interface DropboxTypes$sharing$ListFoldersContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$sharing$ListFoldersContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$ListFoldersContinueError =
//     | DropboxTypes$sharing$ListFoldersContinueErrorInvalidCursor
//     | DropboxTypes$sharing$ListFoldersContinueErrorOther;

//   /**
//   * Result for listFolders() or listMountableFolders(), depending on which
//   * endpoint was requested. Unmounted shared folders can be identified by the
//   * absence of SharedFolderMetadata.path_lower.
//   */
//   declare interface DropboxTypes$sharing$ListFoldersResult {
//     /**
//     * List of all shared folders the authenticated user has access to.
//     */
//     entries: Array<DropboxTypes$sharing$SharedFolderMetadata>;

//     /**
//     * Present if there are additional shared folders that have not been
//     * returned yet. Pass the cursor into the corresponding continue endpoint
//     * (either listFoldersContinue() or listMountableFoldersContinue()) to
//     * list additional folders.
//     */
//     cursor?: string;
//   }

//   declare interface DropboxTypes$sharing$ListSharedLinksArg {
//     /**
//     * See listSharedLinks() description.
//     */
//     path?: DropboxTypes$sharing$ReadPath;

//     /**
//     * The cursor returned by your last call to listSharedLinks().
//     */
//     cursor?: string;

//     /**
//     * See listSharedLinks() description.
//     */
//     direct_only?: boolean;
//   }

//   declare interface DropboxTypes$sharing$ListSharedLinksErrorPath {
//     ".tag": "path";
//     path: DropboxTypes$files$LookupError;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call listSharedLinks() to
//   * obtain a new cursor.
//   */
//   declare interface DropboxTypes$sharing$ListSharedLinksErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$sharing$ListSharedLinksErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$ListSharedLinksError =
//     | DropboxTypes$sharing$ListSharedLinksErrorPath
//     | DropboxTypes$sharing$ListSharedLinksErrorReset
//     | DropboxTypes$sharing$ListSharedLinksErrorOther;

//   declare interface DropboxTypes$sharing$ListSharedLinksResult {
//     /**
//     * Shared links applicable to the path argument.
//     */
//     links: Array<
//       | DropboxTypes$sharing$FileLinkMetadataReference
//       | DropboxTypes$sharing$FolderLinkMetadataReference
//       | DropboxTypes$sharing$SharedLinkMetadataReference
//     >;

//     /**
//     * Is true if there are additional shared links that have not been
//     * returned yet. Pass the cursor into listSharedLinks() to retrieve them.
//     */
//     has_more: boolean;

//     /**
//     * Pass the cursor into listSharedLinks() to obtain the additional links.
//     * Cursor is returned only if no path is given.
//     */
//     cursor?: string;
//   }

//   /**
//   * Contains information about a member's access level to content after an
//   * operation.
//   */
//   declare interface DropboxTypes$sharing$MemberAccessLevelResult {
//     /**
//     * The member still has this level of access to the content through a
//     * parent folder.
//     */
//     access_level?: DropboxTypes$sharing$AccessLevel;

//     /**
//     * A localized string with additional information about why the user has
//     * this access level to the content.
//     */
//     warning?: string;

//     /**
//     * The parent folders that a member has access to. The field is present if
//     * the user has access to the first parent folder where the member gains
//     * access.
//     */
//     access_details?: Array<DropboxTypes$sharing$ParentFolderAccessInfo>;
//   }

//   /**
//   * Allow the member to keep a copy of the folder when removing.
//   */
//   declare interface DropboxTypes$sharing$MemberActionLeaveACopy {
//     ".tag": "leave_a_copy";
//   }

//   /**
//   * Make the member an editor of the folder.
//   */
//   declare interface DropboxTypes$sharing$MemberActionMakeEditor {
//     ".tag": "make_editor";
//   }

//   /**
//   * Make the member an owner of the folder.
//   */
//   declare interface DropboxTypes$sharing$MemberActionMakeOwner {
//     ".tag": "make_owner";
//   }

//   /**
//   * Make the member a viewer of the folder.
//   */
//   declare interface DropboxTypes$sharing$MemberActionMakeViewer {
//     ".tag": "make_viewer";
//   }

//   /**
//   * Make the member a viewer of the folder without commenting permissions.
//   */
//   declare interface DropboxTypes$sharing$MemberActionMakeViewerNoComment {
//     ".tag": "make_viewer_no_comment";
//   }

//   /**
//   * Remove the member from the folder.
//   */
//   declare interface DropboxTypes$sharing$MemberActionRemove {
//     ".tag": "remove";
//   }

//   declare interface DropboxTypes$sharing$MemberActionOther {
//     ".tag": "other";
//   }

//   /**
//   * Actions that may be taken on members of a shared folder.
//   */
//   declare type DropboxTypes$sharing$MemberAction =
//     | DropboxTypes$sharing$MemberActionLeaveACopy
//     | DropboxTypes$sharing$MemberActionMakeEditor
//     | DropboxTypes$sharing$MemberActionMakeOwner
//     | DropboxTypes$sharing$MemberActionMakeViewer
//     | DropboxTypes$sharing$MemberActionMakeViewerNoComment
//     | DropboxTypes$sharing$MemberActionRemove
//     | DropboxTypes$sharing$MemberActionOther;

//   /**
//   * Whether the user is allowed to take the action on the associated member.
//   */
//   declare interface DropboxTypes$sharing$MemberPermission {
//     /**
//     * The action that the user may wish to take on the member.
//     */
//     action: DropboxTypes$sharing$MemberAction;

//     /**
//     * True if the user is allowed to take the action.
//     */
//     allow: boolean;

//     /**
//     * The reason why the user is denied the permission. Not present if the
//     * action is allowed.
//     */
//     reason?: DropboxTypes$sharing$PermissionDeniedReason;
//   }

//   /**
//   * Only a teammate can become a member.
//   */
//   declare interface DropboxTypes$sharing$MemberPolicyTeam {
//     ".tag": "team";
//   }

//   /**
//   * Anyone can become a member.
//   */
//   declare interface DropboxTypes$sharing$MemberPolicyAnyone {
//     ".tag": "anyone";
//   }

//   declare interface DropboxTypes$sharing$MemberPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy governing who can be a member of a shared folder. Only applicable
//   * to folders owned by a user on a team.
//   */
//   declare type DropboxTypes$sharing$MemberPolicy =
//     | DropboxTypes$sharing$MemberPolicyTeam
//     | DropboxTypes$sharing$MemberPolicyAnyone
//     | DropboxTypes$sharing$MemberPolicyOther;

//   /**
//   * Dropbox account, team member, or group ID of member.
//   */
//   declare interface DropboxTypes$sharing$MemberSelectorDropboxId {
//     ".tag": "dropbox_id";
//     dropbox_id: DropboxTypes$sharing$DropboxId;
//   }

//   /**
//   * E-mail address of member.
//   */
//   declare interface DropboxTypes$sharing$MemberSelectorEmail {
//     ".tag": "email";
//     email: DropboxTypes$common$EmailAddress;
//   }

//   declare interface DropboxTypes$sharing$MemberSelectorOther {
//     ".tag": "other";
//   }

//   /**
//   * Includes different ways to identify a member of a shared folder.
//   */
//   declare type DropboxTypes$sharing$MemberSelector =
//     | DropboxTypes$sharing$MemberSelectorDropboxId
//     | DropboxTypes$sharing$MemberSelectorEmail
//     | DropboxTypes$sharing$MemberSelectorOther;

//   /**
//   * The information about a member of the shared content.
//   */
//   declare interface DropboxTypes$sharing$MembershipInfo {
//     /**
//     * The access type for this member. It contains inherited access type from
//     * parent folder, and acquired access type from this folder.
//     */
//     access_type: DropboxTypes$sharing$AccessLevel;

//     /**
//     * The permissions that requesting user has on this member. The set of
//     * permissions corresponds to the MemberActions in the request.
//     */
//     permissions?: Array<DropboxTypes$sharing$MemberPermission>;

//     /**
//     * Never set.
//     */
//     initials?: string;

//     /**
//     * Defaults to False.
//     */
//     is_inherited?: boolean;
//   }

//   declare interface DropboxTypes$sharing$ModifySharedLinkSettingsArgs {
//     /**
//     * URL of the shared link to change its settings.
//     */
//     url: string;

//     /**
//     * Set of settings for the shared link.
//     */
//     settings: DropboxTypes$sharing$SharedLinkSettings;

//     /**
//     * Defaults to False.
//     */
//     remove_expiration?: boolean;
//   }

//   /**
//   * There is an error with the given settings.
//   */
//   declare interface DropboxTypes$sharing$ModifySharedLinkSettingsErrorSettingsError {
//     ".tag": "settings_error";
//     settings_error: DropboxTypes$sharing$SharedLinkSettingsError;
//   }

//   /**
//   * The caller's email should be verified.
//   */
//   declare interface DropboxTypes$sharing$ModifySharedLinkSettingsErrorEmailNotVerified {
//     ".tag": "email_not_verified";
//   }

//   declare type DropboxTypes$sharing$ModifySharedLinkSettingsError =
//     | DropboxTypes$sharing$SharedLinkError
//     | DropboxTypes$sharing$ModifySharedLinkSettingsErrorSettingsError
//     | DropboxTypes$sharing$ModifySharedLinkSettingsErrorEmailNotVerified;

//   declare interface DropboxTypes$sharing$MountFolderArg {
//     /**
//     * The ID of the shared folder to mount.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;
//   }

//   declare interface DropboxTypes$sharing$MountFolderErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * Mounting would cause a shared folder to be inside another, which is
//   * disallowed.
//   */
//   declare interface DropboxTypes$sharing$MountFolderErrorInsideSharedFolder {
//     ".tag": "inside_shared_folder";
//   }

//   /**
//   * The current user does not have enough space to mount the shared folder.
//   */
//   declare type DropboxTypes$sharing$MountFolderErrorInsufficientQuota = {
//     ".tag": "insufficient_quota",
//     ...
//   } & DropboxTypes$sharing$InsufficientQuotaAmounts;

//   /**
//   * The shared folder is already mounted.
//   */
//   declare interface DropboxTypes$sharing$MountFolderErrorAlreadyMounted {
//     ".tag": "already_mounted";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$MountFolderErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * The shared folder is not mountable. One example where this can occur is
//   * when the shared folder belongs within a team folder in the user's
//   * Dropbox.
//   */
//   declare interface DropboxTypes$sharing$MountFolderErrorNotMountable {
//     ".tag": "not_mountable";
//   }

//   declare interface DropboxTypes$sharing$MountFolderErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$MountFolderError =
//     | DropboxTypes$sharing$MountFolderErrorAccessError
//     | DropboxTypes$sharing$MountFolderErrorInsideSharedFolder
//     | DropboxTypes$sharing$MountFolderErrorInsufficientQuota
//     | DropboxTypes$sharing$MountFolderErrorAlreadyMounted
//     | DropboxTypes$sharing$MountFolderErrorNoPermission
//     | DropboxTypes$sharing$MountFolderErrorNotMountable
//     | DropboxTypes$sharing$MountFolderErrorOther;

//   /**
//   * Contains information about a parent folder that a member has access to.
//   */
//   declare interface DropboxTypes$sharing$ParentFolderAccessInfo {
//     /**
//     * Display name for the folder.
//     */
//     folder_name: string;

//     /**
//     * The identifier of the parent shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * The user's permissions for the parent shared folder.
//     */
//     permissions: Array<DropboxTypes$sharing$MemberPermission>;

//     /**
//     * The full path to the parent shared folder relative to the acting user's
//     * root.
//     */
//     path: string;
//   }

//   /**
//   * Metadata for a path-based shared link.
//   */
//   declare type DropboxTypes$sharing$PathLinkMetadata = {
//     /**
//     * Path in user's Dropbox.
//     */
//     path: string,
//     ...
//   } & DropboxTypes$sharing$LinkMetadata;

//   /**
//   * Reference to the PathLinkMetadata type, identified by the value of the
//   * .tag property.
//   */
//   declare type DropboxTypes$sharing$PathLinkMetadataReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "path",
//     ...
//   } & DropboxTypes$sharing$PathLinkMetadata;

//   /**
//   * Assume pending uploads are files.
//   */
//   declare interface DropboxTypes$sharing$PendingUploadModeFile {
//     ".tag": "file";
//   }

//   /**
//   * Assume pending uploads are folders.
//   */
//   declare interface DropboxTypes$sharing$PendingUploadModeFolder {
//     ".tag": "folder";
//   }

//   /**
//   * Flag to indicate pending upload default (for linking to not-yet-existing
//   * paths).
//   */
//   declare type DropboxTypes$sharing$PendingUploadMode =
//     | DropboxTypes$sharing$PendingUploadModeFile
//     | DropboxTypes$sharing$PendingUploadModeFolder;

//   /**
//   * User is not on the same team as the folder owner.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonUserNotSameTeamAsOwner {
//     ".tag": "user_not_same_team_as_owner";
//   }

//   /**
//   * User is prohibited by the owner from taking the action.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonUserNotAllowedByOwner {
//     ".tag": "user_not_allowed_by_owner";
//   }

//   /**
//   * Target is indirectly a member of the folder, for example by being part of
//   * a group.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonTargetIsIndirectMember {
//     ".tag": "target_is_indirect_member";
//   }

//   /**
//   * Target is the owner of the folder.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonTargetIsOwner {
//     ".tag": "target_is_owner";
//   }

//   /**
//   * Target is the user itself.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonTargetIsSelf {
//     ".tag": "target_is_self";
//   }

//   /**
//   * Target is not an active member of the team.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonTargetNotActive {
//     ".tag": "target_not_active";
//   }

//   /**
//   * Folder is team folder for a limited team.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonFolderIsLimitedTeamFolder {
//     ".tag": "folder_is_limited_team_folder";
//   }

//   /**
//   * The content owner needs to be on a Dropbox team to perform this action.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonOwnerNotOnTeam {
//     ".tag": "owner_not_on_team";
//   }

//   /**
//   * The user does not have permission to perform this action on the link.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonPermissionDenied {
//     ".tag": "permission_denied";
//   }

//   /**
//   * The user's team policy prevents performing this action on the link.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonRestrictedByTeam {
//     ".tag": "restricted_by_team";
//   }

//   /**
//   * The user's account type does not support this action.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonUserAccountType {
//     ".tag": "user_account_type";
//   }

//   /**
//   * The user needs to be on a Dropbox team to perform this action.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonUserNotOnTeam {
//     ".tag": "user_not_on_team";
//   }

//   /**
//   * Folder is inside of another shared folder.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonFolderIsInsideSharedFolder {
//     ".tag": "folder_is_inside_shared_folder";
//   }

//   /**
//   * Policy cannot be changed due to restrictions from parent folder.
//   */
//   declare interface DropboxTypes$sharing$PermissionDeniedReasonRestrictedByParentFolder {
//     ".tag": "restricted_by_parent_folder";
//   }

//   declare type DropboxTypes$sharing$PermissionDeniedReasonInsufficientPlan = {
//     ".tag": "insufficient_plan",
//     ...
//   } & DropboxTypes$sharing$InsufficientPlan;

//   declare interface DropboxTypes$sharing$PermissionDeniedReasonOther {
//     ".tag": "other";
//   }

//   /**
//   * Possible reasons the user is denied a permission.
//   */
//   declare type DropboxTypes$sharing$PermissionDeniedReason =
//     | DropboxTypes$sharing$PermissionDeniedReasonUserNotSameTeamAsOwner
//     | DropboxTypes$sharing$PermissionDeniedReasonUserNotAllowedByOwner
//     | DropboxTypes$sharing$PermissionDeniedReasonTargetIsIndirectMember
//     | DropboxTypes$sharing$PermissionDeniedReasonTargetIsOwner
//     | DropboxTypes$sharing$PermissionDeniedReasonTargetIsSelf
//     | DropboxTypes$sharing$PermissionDeniedReasonTargetNotActive
//     | DropboxTypes$sharing$PermissionDeniedReasonFolderIsLimitedTeamFolder
//     | DropboxTypes$sharing$PermissionDeniedReasonOwnerNotOnTeam
//     | DropboxTypes$sharing$PermissionDeniedReasonPermissionDenied
//     | DropboxTypes$sharing$PermissionDeniedReasonRestrictedByTeam
//     | DropboxTypes$sharing$PermissionDeniedReasonUserAccountType
//     | DropboxTypes$sharing$PermissionDeniedReasonUserNotOnTeam
//     | DropboxTypes$sharing$PermissionDeniedReasonFolderIsInsideSharedFolder
//     | DropboxTypes$sharing$PermissionDeniedReasonRestrictedByParentFolder
//     | DropboxTypes$sharing$PermissionDeniedReasonInsufficientPlan
//     | DropboxTypes$sharing$PermissionDeniedReasonOther;

//   declare interface DropboxTypes$sharing$RelinquishFileMembershipArg {
//     /**
//     * The path or id for the file.
//     */
//     file: DropboxTypes$sharing$PathOrId;
//   }

//   declare interface DropboxTypes$sharing$RelinquishFileMembershipErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   /**
//   * The current user has access to the shared file via a group.  You can't
//   * relinquish membership to a file shared via groups.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFileMembershipErrorGroupAccess {
//     ".tag": "group_access";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFileMembershipErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   declare interface DropboxTypes$sharing$RelinquishFileMembershipErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$RelinquishFileMembershipError =
//     | DropboxTypes$sharing$RelinquishFileMembershipErrorAccessError
//     | DropboxTypes$sharing$RelinquishFileMembershipErrorGroupAccess
//     | DropboxTypes$sharing$RelinquishFileMembershipErrorNoPermission
//     | DropboxTypes$sharing$RelinquishFileMembershipErrorOther;

//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * Defaults to False.
//     */
//     leave_a_copy?: boolean;
//   }

//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * The current user is the owner of the shared folder. Owners cannot
//   * relinquish membership to their own folders. Try unsharing or transferring
//   * ownership first.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorFolderOwner {
//     ".tag": "folder_owner";
//   }

//   /**
//   * The shared folder is currently mounted.  Unmount the shared folder before
//   * relinquishing membership.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorMounted {
//     ".tag": "mounted";
//   }

//   /**
//   * The current user has access to the shared folder via a group.  You can't
//   * relinquish membership to folders shared via groups.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorGroupAccess {
//     ".tag": "group_access";
//   }

//   /**
//   * This action cannot be performed on a team shared folder.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorTeamFolder {
//     ".tag": "team_folder";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * The current user only has inherited access to the shared folder.  You
//   * can't relinquish inherited membership to folders.
//   */
//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorNoExplicitAccess {
//     ".tag": "no_explicit_access";
//   }

//   declare interface DropboxTypes$sharing$RelinquishFolderMembershipErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$RelinquishFolderMembershipError =
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorAccessError
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorFolderOwner
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorMounted
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorGroupAccess
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorTeamFolder
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorNoPermission
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorNoExplicitAccess
//     | DropboxTypes$sharing$RelinquishFolderMembershipErrorOther;

//   /**
//   * Arguments for removeFileMember2().
//   */
//   declare interface DropboxTypes$sharing$RemoveFileMemberArg {
//     /**
//     * File from which to remove members.
//     */
//     file: DropboxTypes$sharing$PathOrId;

//     /**
//     * Member to remove from this file. Note that even if an email is
//     * specified, it may result in the removal of a user (not an invitee) if
//     * the user's main account corresponds to that email address.
//     */
//     member: DropboxTypes$sharing$MemberSelector;
//   }

//   declare interface DropboxTypes$sharing$RemoveFileMemberErrorUserError {
//     ".tag": "user_error";
//     user_error: DropboxTypes$sharing$SharingUserError;
//   }

//   declare interface DropboxTypes$sharing$RemoveFileMemberErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   /**
//   * This member does not have explicit access to the file and therefore
//   * cannot be removed. The return value is the access that a user might have
//   * to the file from a parent folder.
//   */
//   declare type DropboxTypes$sharing$RemoveFileMemberErrorNoExplicitAccess = {
//     ".tag": "no_explicit_access",
//     ...
//   } & DropboxTypes$sharing$MemberAccessLevelResult;

//   declare interface DropboxTypes$sharing$RemoveFileMemberErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Errors for removeFileMember2().
//   */
//   declare type DropboxTypes$sharing$RemoveFileMemberError =
//     | DropboxTypes$sharing$RemoveFileMemberErrorUserError
//     | DropboxTypes$sharing$RemoveFileMemberErrorAccessError
//     | DropboxTypes$sharing$RemoveFileMemberErrorNoExplicitAccess
//     | DropboxTypes$sharing$RemoveFileMemberErrorOther;

//   declare interface DropboxTypes$sharing$RemoveFolderMemberArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * The member to remove from the folder.
//     */
//     member: DropboxTypes$sharing$MemberSelector;

//     /**
//     * If true, the removed user will keep their copy of the folder after it's
//     * unshared, assuming it was mounted. Otherwise, it will be removed from
//     * their Dropbox. Also, this must be set to false when kicking a group.
//     */
//     leave_a_copy: boolean;
//   }

//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorMemberError {
//     ".tag": "member_error";
//     member_error: DropboxTypes$sharing$SharedFolderMemberError;
//   }

//   /**
//   * The target user is the owner of the shared folder. You can't remove this
//   * user until ownership has been transferred to another member.
//   */
//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorFolderOwner {
//     ".tag": "folder_owner";
//   }

//   /**
//   * The target user has access to the shared folder via a group.
//   */
//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorGroupAccess {
//     ".tag": "group_access";
//   }

//   /**
//   * This action cannot be performed on a team shared folder.
//   */
//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorTeamFolder {
//     ".tag": "team_folder";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * This shared folder has too many files for leaving a copy. You can still
//   * remove this user without leaving a copy.
//   */
//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   declare interface DropboxTypes$sharing$RemoveFolderMemberErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$RemoveFolderMemberError =
//     | DropboxTypes$sharing$RemoveFolderMemberErrorAccessError
//     | DropboxTypes$sharing$RemoveFolderMemberErrorMemberError
//     | DropboxTypes$sharing$RemoveFolderMemberErrorFolderOwner
//     | DropboxTypes$sharing$RemoveFolderMemberErrorGroupAccess
//     | DropboxTypes$sharing$RemoveFolderMemberErrorTeamFolder
//     | DropboxTypes$sharing$RemoveFolderMemberErrorNoPermission
//     | DropboxTypes$sharing$RemoveFolderMemberErrorTooManyFiles
//     | DropboxTypes$sharing$RemoveFolderMemberErrorOther;

//   /**
//   * Removing the folder member has finished. The value is information about
//   * whether the member has another form of access.
//   */
//   declare type DropboxTypes$sharing$RemoveMemberJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$sharing$MemberAccessLevelResult;

//   declare interface DropboxTypes$sharing$RemoveMemberJobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$sharing$RemoveFolderMemberError;
//   }

//   declare type DropboxTypes$sharing$RemoveMemberJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$sharing$RemoveMemberJobStatusComplete
//     | DropboxTypes$sharing$RemoveMemberJobStatusFailed;

//   /**
//   * Users who use the link can view and comment on the content.
//   */
//   declare interface DropboxTypes$sharing$RequestedLinkAccessLevelViewer {
//     ".tag": "viewer";
//   }

//   /**
//   * Users who use the link can edit, view and comment on the content.
//   */
//   declare interface DropboxTypes$sharing$RequestedLinkAccessLevelEditor {
//     ".tag": "editor";
//   }

//   /**
//   * Request for the maximum access level you can set the link to.
//   */
//   declare interface DropboxTypes$sharing$RequestedLinkAccessLevelMax {
//     ".tag": "max";
//   }

//   declare interface DropboxTypes$sharing$RequestedLinkAccessLevelOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$RequestedLinkAccessLevel =
//     | DropboxTypes$sharing$RequestedLinkAccessLevelViewer
//     | DropboxTypes$sharing$RequestedLinkAccessLevelEditor
//     | DropboxTypes$sharing$RequestedLinkAccessLevelMax
//     | DropboxTypes$sharing$RequestedLinkAccessLevelOther;

//   /**
//   * Anyone who has received the link can access it. No login required.
//   */
//   declare interface DropboxTypes$sharing$RequestedVisibilityPublic {
//     ".tag": "public";
//   }

//   /**
//   * Only members of the same team can access the link. Login is required.
//   */
//   declare interface DropboxTypes$sharing$RequestedVisibilityTeamOnly {
//     ".tag": "team_only";
//   }

//   /**
//   * A link-specific password is required to access the link. Login is not
//   * required.
//   */
//   declare interface DropboxTypes$sharing$RequestedVisibilityPassword {
//     ".tag": "password";
//   }

//   /**
//   * The access permission that can be requested by the caller for the shared
//   * link. Note that the final resolved visibility of the shared link takes
//   * into account other aspects, such as team and shared folder settings.
//   * Check the sharing.ResolvedVisibility for more info on the possible
//   * resolved visibility values of shared links.
//   */
//   declare type DropboxTypes$sharing$RequestedVisibility =
//     | DropboxTypes$sharing$RequestedVisibilityPublic
//     | DropboxTypes$sharing$RequestedVisibilityTeamOnly
//     | DropboxTypes$sharing$RequestedVisibilityPassword;

//   /**
//   * Only members of the same team who have the link-specific password can
//   * access the link. Login is required.
//   */
//   declare interface DropboxTypes$sharing$ResolvedVisibilityTeamAndPassword {
//     ".tag": "team_and_password";
//   }

//   /**
//   * Only members of the shared folder containing the linked file can access
//   * the link. Login is required.
//   */
//   declare interface DropboxTypes$sharing$ResolvedVisibilitySharedFolderOnly {
//     ".tag": "shared_folder_only";
//   }

//   declare interface DropboxTypes$sharing$ResolvedVisibilityOther {
//     ".tag": "other";
//   }

//   /**
//   * The actual access permissions values of shared links after taking into
//   * account user preferences and the team and shared folder settings. Check
//   * the sharing.RequestedVisibility for more info on the possible visibility
//   * values that can be set by the shared link's owner.
//   */
//   declare type DropboxTypes$sharing$ResolvedVisibility =
//     | DropboxTypes$sharing$RequestedVisibility
//     | DropboxTypes$sharing$ResolvedVisibilityTeamAndPassword
//     | DropboxTypes$sharing$ResolvedVisibilitySharedFolderOnly
//     | DropboxTypes$sharing$ResolvedVisibilityOther;

//   declare interface DropboxTypes$sharing$RevokeSharedLinkArg {
//     /**
//     * URL of the shared link.
//     */
//     url: string;
//   }

//   /**
//   * Shared link is malformed.
//   */
//   declare interface DropboxTypes$sharing$RevokeSharedLinkErrorSharedLinkMalformed {
//     ".tag": "shared_link_malformed";
//   }

//   declare type DropboxTypes$sharing$RevokeSharedLinkError =
//     | DropboxTypes$sharing$SharedLinkError
//     | DropboxTypes$sharing$RevokeSharedLinkErrorSharedLinkMalformed;

//   declare interface DropboxTypes$sharing$SetAccessInheritanceArg {
//     /**
//     * Defaults to TagRef(Union(u'AccessInheritance', [UnionField(u'inherit',
//     * Void, False, None), UnionField(u'no_inherit', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'inherit').
//     */
//     access_inheritance?: DropboxTypes$sharing$AccessInheritance;

//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;
//   }

//   /**
//   * Unable to access shared folder.
//   */
//   declare interface DropboxTypes$sharing$SetAccessInheritanceErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$SetAccessInheritanceErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   declare interface DropboxTypes$sharing$SetAccessInheritanceErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$SetAccessInheritanceError =
//     | DropboxTypes$sharing$SetAccessInheritanceErrorAccessError
//     | DropboxTypes$sharing$SetAccessInheritanceErrorNoPermission
//     | DropboxTypes$sharing$SetAccessInheritanceErrorOther;

//   declare type DropboxTypes$sharing$ShareFolderArg = {
//     /**
//     * A list of `FolderAction`s corresponding to `FolderPermission`s that
//     * should appear in the  response's SharedFolderMetadata.permissions field
//     * describing the actions the  authenticated user can perform on the
//     * folder.
//     */
//     actions?: Array<DropboxTypes$sharing$FolderAction>,

//     /**
//     * Settings on the link for this folder.
//     */
//     link_settings?: DropboxTypes$sharing$LinkSettings,
//     ...
//   } & DropboxTypes$sharing$ShareFolderArgBase;

//   declare interface DropboxTypes$sharing$ShareFolderArgBase {
//     /**
//     * Who can add and remove members of this shared folder.
//     */
//     acl_update_policy?: DropboxTypes$sharing$AclUpdatePolicy;

//     /**
//     * Defaults to False.
//     */
//     force_async?: boolean;

//     /**
//     * Who can be a member of this shared folder. Only applicable if the
//     * current user is on a team.
//     */
//     member_policy?: DropboxTypes$sharing$MemberPolicy;

//     /**
//     * The path to the folder to share. If it does not exist, then a new one
//     * is created.
//     */
//     path: DropboxTypes$files$WritePath;

//     /**
//     * The policy to apply to shared links created for content inside this
//     * shared folder.  The current user must be on a team to set this policy
//     * to SharedLinkPolicy.members.
//     */
//     shared_link_policy?: DropboxTypes$sharing$SharedLinkPolicy;

//     /**
//     * Who can enable/disable viewer info for this shared folder.
//     */
//     viewer_info_policy?: DropboxTypes$sharing$ViewerInfoPolicy;

//     /**
//     * Defaults to TagRef(Union(u'AccessInheritance', [UnionField(u'inherit',
//     * Void, False, None), UnionField(u'no_inherit', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'inherit').
//     */
//     access_inheritance?: DropboxTypes$sharing$AccessInheritance;
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$ShareFolderErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   declare type DropboxTypes$sharing$ShareFolderError =
//     | DropboxTypes$sharing$ShareFolderErrorBase
//     | DropboxTypes$sharing$ShareFolderErrorNoPermission;

//   /**
//   * The current user's e-mail address is unverified.
//   */
//   declare interface DropboxTypes$sharing$ShareFolderErrorBaseEmailUnverified {
//     ".tag": "email_unverified";
//   }

//   /**
//   * ShareFolderArg.path is invalid.
//   */
//   declare interface DropboxTypes$sharing$ShareFolderErrorBaseBadPath {
//     ".tag": "bad_path";
//     bad_path: DropboxTypes$sharing$SharePathError;
//   }

//   /**
//   * Team policy is more restrictive than ShareFolderArg.member_policy.
//   */
//   declare interface DropboxTypes$sharing$ShareFolderErrorBaseTeamPolicyDisallowsMemberPolicy {
//     ".tag": "team_policy_disallows_member_policy";
//   }

//   /**
//   * The current user's account is not allowed to select the specified
//   * ShareFolderArg.shared_link_policy.
//   */
//   declare interface DropboxTypes$sharing$ShareFolderErrorBaseDisallowedSharedLinkPolicy {
//     ".tag": "disallowed_shared_link_policy";
//   }

//   declare interface DropboxTypes$sharing$ShareFolderErrorBaseOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$ShareFolderErrorBase =
//     | DropboxTypes$sharing$ShareFolderErrorBaseEmailUnverified
//     | DropboxTypes$sharing$ShareFolderErrorBaseBadPath
//     | DropboxTypes$sharing$ShareFolderErrorBaseTeamPolicyDisallowsMemberPolicy
//     | DropboxTypes$sharing$ShareFolderErrorBaseDisallowedSharedLinkPolicy
//     | DropboxTypes$sharing$ShareFolderErrorBaseOther;

//   /**
//   * The share job has finished. The value is the metadata for the folder.
//   */
//   declare type DropboxTypes$sharing$ShareFolderJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$sharing$SharedFolderMetadata;

//   declare interface DropboxTypes$sharing$ShareFolderJobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$sharing$ShareFolderError;
//   }

//   declare type DropboxTypes$sharing$ShareFolderJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$sharing$ShareFolderJobStatusComplete
//     | DropboxTypes$sharing$ShareFolderJobStatusFailed;

//   declare type DropboxTypes$sharing$ShareFolderLaunchComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$sharing$SharedFolderMetadata;

//   declare type DropboxTypes$sharing$ShareFolderLaunch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$sharing$ShareFolderLaunchComplete;

//   /**
//   * A file is at the specified path.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorIsFile {
//     ".tag": "is_file";
//   }

//   /**
//   * We do not support sharing a folder inside a shared folder.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorInsideSharedFolder {
//     ".tag": "inside_shared_folder";
//   }

//   /**
//   * We do not support shared folders that contain shared folders.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorContainsSharedFolder {
//     ".tag": "contains_shared_folder";
//   }

//   /**
//   * We do not support shared folders that contain app folders.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorContainsAppFolder {
//     ".tag": "contains_app_folder";
//   }

//   /**
//   * We do not support shared folders that contain team folders.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorContainsTeamFolder {
//     ".tag": "contains_team_folder";
//   }

//   /**
//   * We do not support sharing an app folder.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorIsAppFolder {
//     ".tag": "is_app_folder";
//   }

//   /**
//   * We do not support sharing a folder inside an app folder.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorInsideAppFolder {
//     ".tag": "inside_app_folder";
//   }

//   /**
//   * A public folder can't be shared this way. Use a public link instead.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorIsPublicFolder {
//     ".tag": "is_public_folder";
//   }

//   /**
//   * A folder inside a public folder can't be shared this way. Use a public
//   * link instead.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorInsidePublicFolder {
//     ".tag": "inside_public_folder";
//   }

//   /**
//   * Folder is already shared. Contains metadata about the existing shared
//   * folder.
//   */
//   declare type DropboxTypes$sharing$SharePathErrorAlreadyShared = {
//     ".tag": "already_shared",
//     ...
//   } & DropboxTypes$sharing$SharedFolderMetadata;

//   /**
//   * Path is not valid.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorInvalidPath {
//     ".tag": "invalid_path";
//   }

//   /**
//   * We do not support sharing a Mac OS X package.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorIsOsxPackage {
//     ".tag": "is_osx_package";
//   }

//   /**
//   * We do not support sharing a folder inside a Mac OS X package.
//   */
//   declare interface DropboxTypes$sharing$SharePathErrorInsideOsxPackage {
//     ".tag": "inside_osx_package";
//   }

//   declare interface DropboxTypes$sharing$SharePathErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$SharePathError =
//     | DropboxTypes$sharing$SharePathErrorIsFile
//     | DropboxTypes$sharing$SharePathErrorInsideSharedFolder
//     | DropboxTypes$sharing$SharePathErrorContainsSharedFolder
//     | DropboxTypes$sharing$SharePathErrorContainsAppFolder
//     | DropboxTypes$sharing$SharePathErrorContainsTeamFolder
//     | DropboxTypes$sharing$SharePathErrorIsAppFolder
//     | DropboxTypes$sharing$SharePathErrorInsideAppFolder
//     | DropboxTypes$sharing$SharePathErrorIsPublicFolder
//     | DropboxTypes$sharing$SharePathErrorInsidePublicFolder
//     | DropboxTypes$sharing$SharePathErrorAlreadyShared
//     | DropboxTypes$sharing$SharePathErrorInvalidPath
//     | DropboxTypes$sharing$SharePathErrorIsOsxPackage
//     | DropboxTypes$sharing$SharePathErrorInsideOsxPackage
//     | DropboxTypes$sharing$SharePathErrorOther;

//   /**
//   * Metadata of a shared link for a file or folder.
//   */
//   declare type DropboxTypes$sharing$SharedContentLinkMetadata = {
//     /**
//     * The content inside this folder with link audience different than this
//     * folder's. This is only returned when an endpoint that returns metadata
//     * for a single shared folder is called, e.g. /get_folder_metadata.
//     */
//     audience_exceptions?: DropboxTypes$sharing$AudienceExceptions,

//     /**
//     * The URL of the link.
//     */
//     url: string,
//     ...
//   } & DropboxTypes$sharing$SharedContentLinkMetadataBase;

//   declare interface DropboxTypes$sharing$SharedContentLinkMetadataBase {
//     /**
//     * The access level on the link for this file.
//     */
//     access_level?: DropboxTypes$sharing$AccessLevel;

//     /**
//     * The audience options that are available for the content. Some audience
//     * options may be unavailable. For example, team_only may be unavailable
//     * if the content is not owned by a user on a team. The 'default' audience
//     * option is always available if the user can modify link settings.
//     */
//     audience_options: Array<DropboxTypes$sharing$LinkAudience>;

//     /**
//     * The shared folder that prevents the link audience for this link from
//     * being more restrictive.
//     */
//     audience_restricting_shared_folder?: DropboxTypes$sharing$AudienceRestrictingSharedFolder;

//     /**
//     * The current audience of the link.
//     */
//     current_audience: DropboxTypes$sharing$LinkAudience;

//     /**
//     * Whether the link has an expiry set on it. A link with an expiry will
//     * have its  audience changed to members when the expiry is reached.
//     */
//     expiry?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * A list of permissions for actions you can perform on the link.
//     */
//     link_permissions: Array<DropboxTypes$sharing$LinkPermission>;

//     /**
//     * Whether the link is protected by a password.
//     */
//     password_protected: boolean;
//   }

//   /**
//   * Shared file user, group, and invitee membership. Used for the results of
//   * listFileMembers() and listFileMembersContinue(), and used as part of the
//   * results for listFileMembersBatch().
//   */
//   declare interface DropboxTypes$sharing$SharedFileMembers {
//     /**
//     * The list of user members of the shared file.
//     */
//     users: Array<DropboxTypes$sharing$UserFileMembershipInfo>;

//     /**
//     * The list of group members of the shared file.
//     */
//     groups: Array<DropboxTypes$sharing$GroupMembershipInfo>;

//     /**
//     * The list of invited members of a file, but have not logged in and
//     * claimed this.
//     */
//     invitees: Array<DropboxTypes$sharing$InviteeMembershipInfo>;

//     /**
//     * Present if there are additional shared file members that have not been
//     * returned yet. Pass the cursor into listFileMembersContinue() to list
//     * additional members.
//     */
//     cursor?: string;
//   }

//   /**
//   * Properties of the shared file.
//   */
//   declare interface DropboxTypes$sharing$SharedFileMetadata {
//     /**
//     * The current user's access level for this shared file.
//     */
//     access_type?: DropboxTypes$sharing$AccessLevel;

//     /**
//     * The ID of the file.
//     */
//     id: DropboxTypes$files$FileId;

//     /**
//     * The expected metadata of the link associated for the file when it is
//     * first shared. Absent if the link already exists. This is for an
//     * unreleased feature so it may not be returned yet.
//     */
//     expected_link_metadata?: DropboxTypes$sharing$ExpectedSharedContentLinkMetadata;

//     /**
//     * The metadata of the link associated for the file. This is for an
//     * unreleased feature so it may not be returned yet.
//     */
//     link_metadata?: DropboxTypes$sharing$SharedContentLinkMetadata;

//     /**
//     * The name of this file.
//     */
//     name: string;

//     /**
//     * The display names of the users that own the file. If the file is part
//     * of a team folder, the display names of the team admins are also
//     * included. Absent if the owner display names cannot be fetched.
//     */
//     owner_display_names?: Array<string>;

//     /**
//     * The team that owns the file. This field is not present if the file is
//     * not owned by a team.
//     */
//     owner_team?: DropboxTypes$users$Team;

//     /**
//     * The ID of the parent shared folder. This field is present only if the
//     * file is contained within a shared folder.
//     */
//     parent_shared_folder_id?: DropboxTypes$common$SharedFolderId;

//     /**
//     * The cased path to be used for display purposes only. In rare instances
//     * the casing will not correctly match the user's filesystem, but this
//     * behavior will match the path provided in the Core API v1. Absent for
//     * unmounted files.
//     */
//     path_display?: string;

//     /**
//     * The lower-case full path of this file. Absent for unmounted files.
//     */
//     path_lower?: string;

//     /**
//     * The sharing permissions that requesting user has on this file. This
//     * corresponds to the entries given in GetFileMetadataBatchArg.actions or
//     * GetFileMetadataArg.actions.
//     */
//     permissions?: Array<DropboxTypes$sharing$FilePermission>;

//     /**
//     * Policies governing this shared file.
//     */
//     policy: DropboxTypes$sharing$FolderPolicy;

//     /**
//     * URL for displaying a web preview of the shared file.
//     */
//     preview_url: string;

//     /**
//     * Timestamp indicating when the current user was invited to this shared
//     * file. If the user was not invited to the shared file, the timestamp
//     * will indicate when the user was invited to the parent shared folder.
//     * This value may be absent.
//     */
//     time_invited?: DropboxTypes$common$DropboxTimestamp;
//   }

//   /**
//   * This shared folder ID is invalid.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderAccessErrorInvalidId {
//     ".tag": "invalid_id";
//   }

//   /**
//   * The user is not a member of the shared folder thus cannot access it.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderAccessErrorNotAMember {
//     ".tag": "not_a_member";
//   }

//   /**
//   * Never set.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderAccessErrorEmailUnverified {
//     ".tag": "email_unverified";
//   }

//   /**
//   * The shared folder is unmounted.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderAccessErrorUnmounted {
//     ".tag": "unmounted";
//   }

//   declare interface DropboxTypes$sharing$SharedFolderAccessErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * There is an error accessing the shared folder.
//   */
//   declare type DropboxTypes$sharing$SharedFolderAccessError =
//     | DropboxTypes$sharing$SharedFolderAccessErrorInvalidId
//     | DropboxTypes$sharing$SharedFolderAccessErrorNotAMember
//     | DropboxTypes$sharing$SharedFolderAccessErrorEmailUnverified
//     | DropboxTypes$sharing$SharedFolderAccessErrorUnmounted
//     | DropboxTypes$sharing$SharedFolderAccessErrorOther;

//   /**
//   * The target dropbox_id is invalid.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderMemberErrorInvalidDropboxId {
//     ".tag": "invalid_dropbox_id";
//   }

//   /**
//   * The target dropbox_id is not a member of the shared folder.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderMemberErrorNotAMember {
//     ".tag": "not_a_member";
//   }

//   /**
//   * The target member only has inherited access to the shared folder.
//   */
//   declare type DropboxTypes$sharing$SharedFolderMemberErrorNoExplicitAccess = {
//     ".tag": "no_explicit_access",
//     ...
//   } & DropboxTypes$sharing$MemberAccessLevelResult;

//   declare interface DropboxTypes$sharing$SharedFolderMemberErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$SharedFolderMemberError =
//     | DropboxTypes$sharing$SharedFolderMemberErrorInvalidDropboxId
//     | DropboxTypes$sharing$SharedFolderMemberErrorNotAMember
//     | DropboxTypes$sharing$SharedFolderMemberErrorNoExplicitAccess
//     | DropboxTypes$sharing$SharedFolderMemberErrorOther;

//   /**
//   * Shared folder user and group membership.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderMembers {
//     /**
//     * The list of user members of the shared folder.
//     */
//     users: Array<DropboxTypes$sharing$UserMembershipInfo>;

//     /**
//     * The list of group members of the shared folder.
//     */
//     groups: Array<DropboxTypes$sharing$GroupMembershipInfo>;

//     /**
//     * The list of invitees to the shared folder.
//     */
//     invitees: Array<DropboxTypes$sharing$InviteeMembershipInfo>;

//     /**
//     * Present if there are additional shared folder members that have not
//     * been returned yet. Pass the cursor into listFolderMembersContinue() to
//     * list additional members.
//     */
//     cursor?: string;
//   }

//   /**
//   * The metadata which includes basic information about the shared folder.
//   */
//   declare type DropboxTypes$sharing$SharedFolderMetadata = {
//     /**
//     * The metadata of the shared content link to this shared folder. Absent
//     * if there is no link on the folder. This is for an unreleased feature so
//     * it may not be returned yet.
//     */
//     link_metadata?: DropboxTypes$sharing$SharedContentLinkMetadata,

//     /**
//     * The name of the this shared folder.
//     */
//     name: string,

//     /**
//     * Actions the current user may perform on the folder and its contents.
//     * The set of permissions corresponds to the FolderActions in the request.
//     */
//     permissions?: Array<DropboxTypes$sharing$FolderPermission>,

//     /**
//     * Policies governing this shared folder.
//     */
//     policy: DropboxTypes$sharing$FolderPolicy,

//     /**
//     * URL for displaying a web preview of the shared folder.
//     */
//     preview_url: string,

//     /**
//     * The ID of the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId,

//     /**
//     * Timestamp indicating when the current user was invited to this shared
//     * folder.
//     */
//     time_invited: DropboxTypes$common$DropboxTimestamp,

//     /**
//     * Defaults to TagRef(Union(u'AccessInheritance', [UnionField(u'inherit',
//     * Void, False, None), UnionField(u'no_inherit', Void, False, None),
//     * UnionField(u'other', Void, True, None)]), u'inherit').
//     */
//     access_inheritance?: DropboxTypes$sharing$AccessInheritance,
//     ...
//   } & DropboxTypes$sharing$SharedFolderMetadataBase;

//   /**
//   * Properties of the shared folder.
//   */
//   declare interface DropboxTypes$sharing$SharedFolderMetadataBase {
//     /**
//     * The current user's access level for this shared folder.
//     */
//     access_type: DropboxTypes$sharing$AccessLevel;

//     /**
//     * Whether this folder is inside of a team folder.
//     */
//     is_inside_team_folder: boolean;

//     /**
//     * Whether this folder is a [team folder]{@link
//     * https://www.dropbox.com/en/help/986}.
//     */
//     is_team_folder: boolean;

//     /**
//     * The display names of the users that own the folder. If the folder is
//     * part of a team folder, the display names of the team admins are also
//     * included. Absent if the owner display names cannot be fetched.
//     */
//     owner_display_names?: Array<string>;

//     /**
//     * The team that owns the folder. This field is not present if the folder
//     * is not owned by a team.
//     */
//     owner_team?: DropboxTypes$users$Team;

//     /**
//     * The ID of the parent shared folder. This field is present only if the
//     * folder is contained within another shared folder.
//     */
//     parent_shared_folder_id?: DropboxTypes$common$SharedFolderId;

//     /**
//     * The lower-cased full path of this shared folder. Absent for unmounted
//     * folders.
//     */
//     path_lower?: string;
//   }

//   /**
//   * User is not logged in.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkAccessFailureReasonLoginRequired {
//     ".tag": "login_required";
//   }

//   /**
//   * User's email is not verified.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkAccessFailureReasonEmailVerifyRequired {
//     ".tag": "email_verify_required";
//   }

//   /**
//   * The link is password protected.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkAccessFailureReasonPasswordRequired {
//     ".tag": "password_required";
//   }

//   /**
//   * Access is allowed for team members only.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkAccessFailureReasonTeamOnly {
//     ".tag": "team_only";
//   }

//   /**
//   * Access is allowed for the shared link's owner only.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkAccessFailureReasonOwnerOnly {
//     ".tag": "owner_only";
//   }

//   declare interface DropboxTypes$sharing$SharedLinkAccessFailureReasonOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$SharedLinkAccessFailureReason =
//     | DropboxTypes$sharing$SharedLinkAccessFailureReasonLoginRequired
//     | DropboxTypes$sharing$SharedLinkAccessFailureReasonEmailVerifyRequired
//     | DropboxTypes$sharing$SharedLinkAccessFailureReasonPasswordRequired
//     | DropboxTypes$sharing$SharedLinkAccessFailureReasonTeamOnly
//     | DropboxTypes$sharing$SharedLinkAccessFailureReasonOwnerOnly
//     | DropboxTypes$sharing$SharedLinkAccessFailureReasonOther;

//   /**
//   * Metadata of the shared link that already exists.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkAlreadyExistsMetadataMetadata {
//     ".tag": "metadata";
//     metadata:
//       | DropboxTypes$sharing$FileLinkMetadataReference
//       | DropboxTypes$sharing$FolderLinkMetadataReference
//       | DropboxTypes$sharing$SharedLinkMetadataReference;
//   }

//   declare interface DropboxTypes$sharing$SharedLinkAlreadyExistsMetadataOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$SharedLinkAlreadyExistsMetadata =
//     | DropboxTypes$sharing$SharedLinkAlreadyExistsMetadataMetadata
//     | DropboxTypes$sharing$SharedLinkAlreadyExistsMetadataOther;

//   /**
//   * The shared link wasn't found.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkErrorSharedLinkNotFound {
//     ".tag": "shared_link_not_found";
//   }

//   /**
//   * The caller is not allowed to access this shared link.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkErrorSharedLinkAccessDenied {
//     ".tag": "shared_link_access_denied";
//   }

//   /**
//   * This type of link is not supported; use files() instead.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkErrorUnsupportedLinkType {
//     ".tag": "unsupported_link_type";
//   }

//   declare interface DropboxTypes$sharing$SharedLinkErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$SharedLinkError =
//     | DropboxTypes$sharing$SharedLinkErrorSharedLinkNotFound
//     | DropboxTypes$sharing$SharedLinkErrorSharedLinkAccessDenied
//     | DropboxTypes$sharing$SharedLinkErrorUnsupportedLinkType
//     | DropboxTypes$sharing$SharedLinkErrorOther;

//   /**
//   * The metadata of a shared link.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkMetadata {
//     /**
//     * URL of the shared link.
//     */
//     url: string;

//     /**
//     * A unique identifier for the linked file.
//     */
//     id?: DropboxTypes$sharing$Id;

//     /**
//     * The linked file name (including extension). This never contains a
//     * slash.
//     */
//     name: string;

//     /**
//     * Expiration time, if set. By default the link won't expire.
//     */
//     expires?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The lowercased full path in the user's Dropbox. This always starts with
//     * a slash. This field will only be present only if the linked file is in
//     * the authenticated user's  dropbox.
//     */
//     path_lower?: string;

//     /**
//     * The link's access permissions.
//     */
//     link_permissions: DropboxTypes$sharing$LinkPermissions;

//     /**
//     * The team membership information of the link's owner.  This field will
//     * only be present  if the link's owner is a team member.
//     */
//     team_member_info?: DropboxTypes$sharing$TeamMemberInfo;

//     /**
//     * The team information of the content's owner. This field will only be
//     * present if the content's owner is a team member and the content's owner
//     * team is different from the link's owner team.
//     */
//     content_owner_team_info?: DropboxTypes$sharing$TeamInfo;
//   }

//   /**
//   * Reference to the SharedLinkMetadata polymorphic type. Contains a .tag
//   * property to let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$sharing$SharedLinkMetadataReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "file" | "folder",
//     ...
//   } & DropboxTypes$sharing$SharedLinkMetadata;

//   /**
//   * Links can be shared with anyone.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkPolicyAnyone {
//     ".tag": "anyone";
//   }

//   /**
//   * Links can be shared with anyone on the same team as the owner.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkPolicyTeam {
//     ".tag": "team";
//   }

//   /**
//   * Links can only be shared among members of the shared folder.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkPolicyMembers {
//     ".tag": "members";
//   }

//   declare interface DropboxTypes$sharing$SharedLinkPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Who can view shared links in this folder.
//   */
//   declare type DropboxTypes$sharing$SharedLinkPolicy =
//     | DropboxTypes$sharing$SharedLinkPolicyAnyone
//     | DropboxTypes$sharing$SharedLinkPolicyTeam
//     | DropboxTypes$sharing$SharedLinkPolicyMembers
//     | DropboxTypes$sharing$SharedLinkPolicyOther;

//   declare interface DropboxTypes$sharing$SharedLinkSettings {
//     /**
//     * The requested access for this shared link.
//     */
//     requested_visibility?: DropboxTypes$sharing$RequestedVisibility;

//     /**
//     * If requested_visibility is RequestedVisibility.password this is needed
//     * to specify the password to access the link.
//     */
//     link_password?: string;

//     /**
//     * Expiration time of the shared link. By default the link won't expire.
//     */
//     expires?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The new audience who can benefit from the access level specified by the
//     * link's access level specified in the `link_access_level` field of
//     * `LinkPermissions`. This is used in conjunction with team policies and
//     * shared folder policies to determine the final effective audience type
//     * in the `effective_audience` field of `LinkPermissions.
//     */
//     audience?: DropboxTypes$sharing$LinkAudience;

//     /**
//     * Requested access level you want the audience to gain from this link.
//     */
//     access?: DropboxTypes$sharing$RequestedLinkAccessLevel;
//   }

//   /**
//   * The given settings are invalid (for example, all attributes of the
//   * sharing.SharedLinkSettings are empty, the requested visibility is
//   * RequestedVisibility.password but the SharedLinkSettings.link_password is
//   * missing, SharedLinkSettings.expires is set to the past, etc.).
//   */
//   declare interface DropboxTypes$sharing$SharedLinkSettingsErrorInvalidSettings {
//     ".tag": "invalid_settings";
//   }

//   /**
//   * User is not allowed to modify the settings of this link. Note that basic
//   * users can only set RequestedVisibility.public as the
//   * SharedLinkSettings.requested_visibility and cannot set
//   * SharedLinkSettings.expires.
//   */
//   declare interface DropboxTypes$sharing$SharedLinkSettingsErrorNotAuthorized {
//     ".tag": "not_authorized";
//   }

//   declare type DropboxTypes$sharing$SharedLinkSettingsError =
//     | DropboxTypes$sharing$SharedLinkSettingsErrorInvalidSettings
//     | DropboxTypes$sharing$SharedLinkSettingsErrorNotAuthorized;

//   /**
//   * Current user does not have sufficient privileges to perform the desired
//   * action.
//   */
//   declare interface DropboxTypes$sharing$SharingFileAccessErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * File specified was not found.
//   */
//   declare interface DropboxTypes$sharing$SharingFileAccessErrorInvalidFile {
//     ".tag": "invalid_file";
//   }

//   /**
//   * A folder can't be shared this way. Use folder sharing or a shared link
//   * instead.
//   */
//   declare interface DropboxTypes$sharing$SharingFileAccessErrorIsFolder {
//     ".tag": "is_folder";
//   }

//   /**
//   * A file inside a public folder can't be shared this way. Use a public link
//   * instead.
//   */
//   declare interface DropboxTypes$sharing$SharingFileAccessErrorInsidePublicFolder {
//     ".tag": "inside_public_folder";
//   }

//   /**
//   * A Mac OS X package can't be shared this way. Use a shared link instead.
//   */
//   declare interface DropboxTypes$sharing$SharingFileAccessErrorInsideOsxPackage {
//     ".tag": "inside_osx_package";
//   }

//   declare interface DropboxTypes$sharing$SharingFileAccessErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * User could not access this file.
//   */
//   declare type DropboxTypes$sharing$SharingFileAccessError =
//     | DropboxTypes$sharing$SharingFileAccessErrorNoPermission
//     | DropboxTypes$sharing$SharingFileAccessErrorInvalidFile
//     | DropboxTypes$sharing$SharingFileAccessErrorIsFolder
//     | DropboxTypes$sharing$SharingFileAccessErrorInsidePublicFolder
//     | DropboxTypes$sharing$SharingFileAccessErrorInsideOsxPackage
//     | DropboxTypes$sharing$SharingFileAccessErrorOther;

//   /**
//   * The current user must verify the account e-mail address before performing
//   * this action.
//   */
//   declare interface DropboxTypes$sharing$SharingUserErrorEmailUnverified {
//     ".tag": "email_unverified";
//   }

//   declare interface DropboxTypes$sharing$SharingUserErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * User account had a problem preventing this action.
//   */
//   declare type DropboxTypes$sharing$SharingUserError =
//     | DropboxTypes$sharing$SharingUserErrorEmailUnverified
//     | DropboxTypes$sharing$SharingUserErrorOther;

//   /**
//   * Information about a team member.
//   */
//   declare interface DropboxTypes$sharing$TeamMemberInfo {
//     /**
//     * Information about the member's team.
//     */
//     team_info: DropboxTypes$sharing$TeamInfo;

//     /**
//     * The display name of the user.
//     */
//     display_name: string;

//     /**
//     * ID of user as a member of a team. This field will only be present if
//     * the member is in the same team as current user.
//     */
//     member_id?: string;
//   }

//   declare interface DropboxTypes$sharing$TransferFolderArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * A account or team member ID to transfer ownership to.
//     */
//     to_dropbox_id: DropboxTypes$sharing$DropboxId;
//   }

//   declare interface DropboxTypes$sharing$TransferFolderErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * TransferFolderArg.to_dropbox_id is invalid.
//   */
//   declare interface DropboxTypes$sharing$TransferFolderErrorInvalidDropboxId {
//     ".tag": "invalid_dropbox_id";
//   }

//   /**
//   * The new designated owner is not currently a member of the shared folder.
//   */
//   declare interface DropboxTypes$sharing$TransferFolderErrorNewOwnerNotAMember {
//     ".tag": "new_owner_not_a_member";
//   }

//   /**
//   * The new designated owner has not added the folder to their Dropbox.
//   */
//   declare interface DropboxTypes$sharing$TransferFolderErrorNewOwnerUnmounted {
//     ".tag": "new_owner_unmounted";
//   }

//   /**
//   * The new designated owner's e-mail address is unverified.
//   */
//   declare interface DropboxTypes$sharing$TransferFolderErrorNewOwnerEmailUnverified {
//     ".tag": "new_owner_email_unverified";
//   }

//   /**
//   * This action cannot be performed on a team shared folder.
//   */
//   declare interface DropboxTypes$sharing$TransferFolderErrorTeamFolder {
//     ".tag": "team_folder";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$TransferFolderErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   declare interface DropboxTypes$sharing$TransferFolderErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$TransferFolderError =
//     | DropboxTypes$sharing$TransferFolderErrorAccessError
//     | DropboxTypes$sharing$TransferFolderErrorInvalidDropboxId
//     | DropboxTypes$sharing$TransferFolderErrorNewOwnerNotAMember
//     | DropboxTypes$sharing$TransferFolderErrorNewOwnerUnmounted
//     | DropboxTypes$sharing$TransferFolderErrorNewOwnerEmailUnverified
//     | DropboxTypes$sharing$TransferFolderErrorTeamFolder
//     | DropboxTypes$sharing$TransferFolderErrorNoPermission
//     | DropboxTypes$sharing$TransferFolderErrorOther;

//   declare interface DropboxTypes$sharing$UnmountFolderArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;
//   }

//   declare interface DropboxTypes$sharing$UnmountFolderErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$UnmountFolderErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * The shared folder can't be unmounted. One example where this can occur is
//   * when the shared folder's parent folder is also a shared folder that
//   * resides in the current user's Dropbox.
//   */
//   declare interface DropboxTypes$sharing$UnmountFolderErrorNotUnmountable {
//     ".tag": "not_unmountable";
//   }

//   declare interface DropboxTypes$sharing$UnmountFolderErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$UnmountFolderError =
//     | DropboxTypes$sharing$UnmountFolderErrorAccessError
//     | DropboxTypes$sharing$UnmountFolderErrorNoPermission
//     | DropboxTypes$sharing$UnmountFolderErrorNotUnmountable
//     | DropboxTypes$sharing$UnmountFolderErrorOther;

//   /**
//   * Arguments for unshareFile().
//   */
//   declare interface DropboxTypes$sharing$UnshareFileArg {
//     /**
//     * The file to unshare.
//     */
//     file: DropboxTypes$sharing$PathOrId;
//   }

//   declare interface DropboxTypes$sharing$UnshareFileErrorUserError {
//     ".tag": "user_error";
//     user_error: DropboxTypes$sharing$SharingUserError;
//   }

//   declare interface DropboxTypes$sharing$UnshareFileErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharingFileAccessError;
//   }

//   declare interface DropboxTypes$sharing$UnshareFileErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error result for unshareFile().
//   */
//   declare type DropboxTypes$sharing$UnshareFileError =
//     | DropboxTypes$sharing$UnshareFileErrorUserError
//     | DropboxTypes$sharing$UnshareFileErrorAccessError
//     | DropboxTypes$sharing$UnshareFileErrorOther;

//   declare interface DropboxTypes$sharing$UnshareFolderArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * Defaults to False.
//     */
//     leave_a_copy?: boolean;
//   }

//   declare interface DropboxTypes$sharing$UnshareFolderErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * This action cannot be performed on a team shared folder.
//   */
//   declare interface DropboxTypes$sharing$UnshareFolderErrorTeamFolder {
//     ".tag": "team_folder";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$UnshareFolderErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * This shared folder has too many files to be unshared.
//   */
//   declare interface DropboxTypes$sharing$UnshareFolderErrorTooManyFiles {
//     ".tag": "too_many_files";
//   }

//   declare interface DropboxTypes$sharing$UnshareFolderErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$UnshareFolderError =
//     | DropboxTypes$sharing$UnshareFolderErrorAccessError
//     | DropboxTypes$sharing$UnshareFolderErrorTeamFolder
//     | DropboxTypes$sharing$UnshareFolderErrorNoPermission
//     | DropboxTypes$sharing$UnshareFolderErrorTooManyFiles
//     | DropboxTypes$sharing$UnshareFolderErrorOther;

//   /**
//   * Arguments for updateFileMember().
//   */
//   declare type DropboxTypes$sharing$UpdateFileMemberArgs = {
//     ...
//   } & DropboxTypes$sharing$ChangeFileMemberAccessArgs;

//   declare interface DropboxTypes$sharing$UpdateFolderMemberArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * The member of the shared folder to update.  Only the
//     * MemberSelector.dropbox_id may be set at this time.
//     */
//     member: DropboxTypes$sharing$MemberSelector;

//     /**
//     * The new access level for member. AccessLevel.owner is disallowed.
//     */
//     access_level: DropboxTypes$sharing$AccessLevel;
//   }

//   declare interface DropboxTypes$sharing$UpdateFolderMemberErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   declare interface DropboxTypes$sharing$UpdateFolderMemberErrorMemberError {
//     ".tag": "member_error";
//     member_error: DropboxTypes$sharing$SharedFolderMemberError;
//   }

//   /**
//   * If updating the access type required the member to be added to the shared
//   * folder and there was an error when adding the member.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderMemberErrorNoExplicitAccess {
//     ".tag": "no_explicit_access";
//     no_explicit_access: DropboxTypes$sharing$AddFolderMemberError;
//   }

//   /**
//   * The current user's account doesn't support this action. An example of
//   * this is when downgrading a member from editor to viewer. This action can
//   * only be performed by users that have upgraded to a Pro or Business plan.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderMemberErrorInsufficientPlan {
//     ".tag": "insufficient_plan";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderMemberErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   declare interface DropboxTypes$sharing$UpdateFolderMemberErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$UpdateFolderMemberError =
//     | DropboxTypes$sharing$UpdateFolderMemberErrorAccessError
//     | DropboxTypes$sharing$UpdateFolderMemberErrorMemberError
//     | DropboxTypes$sharing$UpdateFolderMemberErrorNoExplicitAccess
//     | DropboxTypes$sharing$UpdateFolderMemberErrorInsufficientPlan
//     | DropboxTypes$sharing$UpdateFolderMemberErrorNoPermission
//     | DropboxTypes$sharing$UpdateFolderMemberErrorOther;

//   /**
//   * If any of the policies are unset, then they retain their current setting.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderPolicyArg {
//     /**
//     * The ID for the shared folder.
//     */
//     shared_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * Who can be a member of this shared folder. Only applicable if the
//     * current user is on a team.
//     */
//     member_policy?: DropboxTypes$sharing$MemberPolicy;

//     /**
//     * Who can add and remove members of this shared folder.
//     */
//     acl_update_policy?: DropboxTypes$sharing$AclUpdatePolicy;

//     /**
//     * Who can enable/disable viewer info for this shared folder.
//     */
//     viewer_info_policy?: DropboxTypes$sharing$ViewerInfoPolicy;

//     /**
//     * The policy to apply to shared links created for content inside this
//     * shared folder. The current user must be on a team to set this policy to
//     * SharedLinkPolicy.members.
//     */
//     shared_link_policy?: DropboxTypes$sharing$SharedLinkPolicy;

//     /**
//     * Settings on the link for this folder.
//     */
//     link_settings?: DropboxTypes$sharing$LinkSettings;

//     /**
//     * A list of `FolderAction`s corresponding to `FolderPermission`s that
//     * should appear in the  response's SharedFolderMetadata.permissions field
//     * describing the actions the  authenticated user can perform on the
//     * folder.
//     */
//     actions?: Array<DropboxTypes$sharing$FolderAction>;
//   }

//   declare interface DropboxTypes$sharing$UpdateFolderPolicyErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$sharing$SharedFolderAccessError;
//   }

//   /**
//   * UpdateFolderPolicyArg.member_policy was set even though user is not on a
//   * team.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderPolicyErrorNotOnTeam {
//     ".tag": "not_on_team";
//   }

//   /**
//   * Team policy is more restrictive than ShareFolderArg.member_policy.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderPolicyErrorTeamPolicyDisallowsMemberPolicy {
//     ".tag": "team_policy_disallows_member_policy";
//   }

//   /**
//   * The current account is not allowed to select the specified
//   * ShareFolderArg.shared_link_policy.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderPolicyErrorDisallowedSharedLinkPolicy {
//     ".tag": "disallowed_shared_link_policy";
//   }

//   /**
//   * The current user does not have permission to perform this action.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderPolicyErrorNoPermission {
//     ".tag": "no_permission";
//   }

//   /**
//   * This action cannot be performed on a team shared folder.
//   */
//   declare interface DropboxTypes$sharing$UpdateFolderPolicyErrorTeamFolder {
//     ".tag": "team_folder";
//   }

//   declare interface DropboxTypes$sharing$UpdateFolderPolicyErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$UpdateFolderPolicyError =
//     | DropboxTypes$sharing$UpdateFolderPolicyErrorAccessError
//     | DropboxTypes$sharing$UpdateFolderPolicyErrorNotOnTeam
//     | DropboxTypes$sharing$UpdateFolderPolicyErrorTeamPolicyDisallowsMemberPolicy
//     | DropboxTypes$sharing$UpdateFolderPolicyErrorDisallowedSharedLinkPolicy
//     | DropboxTypes$sharing$UpdateFolderPolicyErrorNoPermission
//     | DropboxTypes$sharing$UpdateFolderPolicyErrorTeamFolder
//     | DropboxTypes$sharing$UpdateFolderPolicyErrorOther;

//   /**
//   * The information about a user member of the shared content with an
//   * appended last seen timestamp.
//   */
//   declare type DropboxTypes$sharing$UserFileMembershipInfo = {
//     /**
//     * The UTC timestamp of when the user has last seen the content, if they
//     * have.
//     */
//     time_last_seen?: DropboxTypes$common$DropboxTimestamp,

//     /**
//     * The platform on which the user has last seen the content, or unknown.
//     */
//     platform_type?: DropboxTypes$seen_state$PlatformType,
//     ...
//   } & DropboxTypes$sharing$UserMembershipInfo;

//   /**
//   * Basic information about a user. Use usersAccount() and
//   * usersAccountBatch() to obtain more detailed information.
//   */
//   declare interface DropboxTypes$sharing$UserInfo {
//     /**
//     * The account ID of the user.
//     */
//     account_id: DropboxTypes$users_common$AccountId;

//     /**
//     * Email address of user.
//     */
//     email: string;

//     /**
//     * The display name of the user.
//     */
//     display_name: string;

//     /**
//     * If the user is in the same team as current user.
//     */
//     same_team: boolean;

//     /**
//     * The team member ID of the shared folder member. Only present if
//     * same_team is true.
//     */
//     team_member_id?: string;
//   }

//   /**
//   * The information about a user member of the shared content.
//   */
//   declare type DropboxTypes$sharing$UserMembershipInfo = {
//     /**
//     * The account information for the membership user.
//     */
//     user: DropboxTypes$sharing$UserInfo,
//     ...
//   } & DropboxTypes$sharing$MembershipInfo;

//   /**
//   * Viewer information is available on this file.
//   */
//   declare interface DropboxTypes$sharing$ViewerInfoPolicyEnabled {
//     ".tag": "enabled";
//   }

//   /**
//   * Viewer information is disabled on this file.
//   */
//   declare interface DropboxTypes$sharing$ViewerInfoPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$sharing$ViewerInfoPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$sharing$ViewerInfoPolicy =
//     | DropboxTypes$sharing$ViewerInfoPolicyEnabled
//     | DropboxTypes$sharing$ViewerInfoPolicyDisabled
//     | DropboxTypes$sharing$ViewerInfoPolicyOther;

//   /**
//   * Anyone who has received the link can access it. No login required.
//   */
//   declare interface DropboxTypes$sharing$VisibilityPublic {
//     ".tag": "public";
//   }

//   /**
//   * Only members of the same team can access the link. Login is required.
//   */
//   declare interface DropboxTypes$sharing$VisibilityTeamOnly {
//     ".tag": "team_only";
//   }

//   /**
//   * A link-specific password is required to access the link. Login is not
//   * required.
//   */
//   declare interface DropboxTypes$sharing$VisibilityPassword {
//     ".tag": "password";
//   }

//   /**
//   * Only members of the same team who have the link-specific password can
//   * access the link.
//   */
//   declare interface DropboxTypes$sharing$VisibilityTeamAndPassword {
//     ".tag": "team_and_password";
//   }

//   /**
//   * Only members of the shared folder containing the linked file can access
//   * the link. Login is required.
//   */
//   declare interface DropboxTypes$sharing$VisibilitySharedFolderOnly {
//     ".tag": "shared_folder_only";
//   }

//   declare interface DropboxTypes$sharing$VisibilityOther {
//     ".tag": "other";
//   }

//   /**
//   * Who can access a shared link. The most open visibility is public. The
//   * default depends on many aspects, such as team and user preferences and
//   * shared folder settings.
//   */
//   declare type DropboxTypes$sharing$Visibility =
//     | DropboxTypes$sharing$VisibilityPublic
//     | DropboxTypes$sharing$VisibilityTeamOnly
//     | DropboxTypes$sharing$VisibilityPassword
//     | DropboxTypes$sharing$VisibilityTeamAndPassword
//     | DropboxTypes$sharing$VisibilitySharedFolderOnly
//     | DropboxTypes$sharing$VisibilityOther;

//   declare type DropboxTypes$sharing$DropboxId = string;

//   declare type DropboxTypes$sharing$GetSharedLinkFileArg = DropboxTypes$sharing$GetSharedLinkMetadataArg;

//   declare type DropboxTypes$sharing$Id = DropboxTypes$files$Id;

//   declare type DropboxTypes$sharing$Path = DropboxTypes$files$Path;

//   declare type DropboxTypes$sharing$PathOrId = string;

//   declare type DropboxTypes$sharing$ReadPath = DropboxTypes$files$ReadPath;

//   declare type DropboxTypes$sharing$Rev = DropboxTypes$files$Rev;

//   declare type DropboxTypes$sharing$TeamInfo = DropboxTypes$users$Team;

//   /**
//   * Information on active web sessions.
//   */
//   declare type DropboxTypes$team$ActiveWebSession = {
//     /**
//     * Information on the hosting device.
//     */
//     user_agent: string,

//     /**
//     * Information on the hosting operating system.
//     */
//     os: string,

//     /**
//     * Information on the browser used for this web session.
//     */
//     browser: string,

//     /**
//     * The time this session expires.
//     */
//     expires?: DropboxTypes$common$DropboxTimestamp,
//     ...
//   } & DropboxTypes$team$DeviceSession;

//   /**
//   * User is an administrator of the team - has all permissions.
//   */
//   declare interface DropboxTypes$team$AdminTierTeamAdmin {
//     ".tag": "team_admin";
//   }

//   /**
//   * User can do most user provisioning, de-provisioning and management.
//   */
//   declare interface DropboxTypes$team$AdminTierUserManagementAdmin {
//     ".tag": "user_management_admin";
//   }

//   /**
//   * User can do a limited set of common support tasks for existing users.
//   */
//   declare interface DropboxTypes$team$AdminTierSupportAdmin {
//     ".tag": "support_admin";
//   }

//   /**
//   * User is not an admin of the team.
//   */
//   declare interface DropboxTypes$team$AdminTierMemberOnly {
//     ".tag": "member_only";
//   }

//   /**
//   * Describes which team-related admin permissions a user has.
//   */
//   declare type DropboxTypes$team$AdminTier =
//     | DropboxTypes$team$AdminTierTeamAdmin
//     | DropboxTypes$team$AdminTierUserManagementAdmin
//     | DropboxTypes$team$AdminTierSupportAdmin
//     | DropboxTypes$team$AdminTierMemberOnly;

//   /**
//   * Information on linked third party applications.
//   */
//   declare interface DropboxTypes$team$ApiApp {
//     /**
//     * The application unique id.
//     */
//     app_id: string;

//     /**
//     * The application name.
//     */
//     app_name: string;

//     /**
//     * The application publisher name.
//     */
//     publisher?: string;

//     /**
//     * The publisher's URL.
//     */
//     publisher_url?: string;

//     /**
//     * The time this application was linked.
//     */
//     linked?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * Whether the linked application uses a dedicated folder.
//     */
//     is_app_folder: boolean;
//   }

//   /**
//   * Base report structure.
//   */
//   declare interface DropboxTypes$team$BaseDfbReport {
//     /**
//     * First date present in the results as 'YYYY-MM-DD' or None.
//     */
//     start_date: string;
//   }

//   declare interface DropboxTypes$team$BaseTeamFolderErrorAccessError {
//     ".tag": "access_error";
//     access_error: DropboxTypes$team$TeamFolderAccessError;
//   }

//   declare interface DropboxTypes$team$BaseTeamFolderErrorStatusError {
//     ".tag": "status_error";
//     status_error: DropboxTypes$team$TeamFolderInvalidStatusError;
//   }

//   declare interface DropboxTypes$team$BaseTeamFolderErrorTeamSharedDropboxError {
//     ".tag": "team_shared_dropbox_error";
//     team_shared_dropbox_error: DropboxTypes$team$TeamFolderTeamSharedDropboxError;
//   }

//   declare interface DropboxTypes$team$BaseTeamFolderErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Base error that all errors for existing team folders should extend.
//   */
//   declare type DropboxTypes$team$BaseTeamFolderError =
//     | DropboxTypes$team$BaseTeamFolderErrorAccessError
//     | DropboxTypes$team$BaseTeamFolderErrorStatusError
//     | DropboxTypes$team$BaseTeamFolderErrorTeamSharedDropboxError
//     | DropboxTypes$team$BaseTeamFolderErrorOther;

//   /**
//   * A maximum of 1000 users can be set for a single call.
//   */
//   declare interface DropboxTypes$team$CustomQuotaErrorTooManyUsers {
//     ".tag": "too_many_users";
//   }

//   declare interface DropboxTypes$team$CustomQuotaErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned when getting member custom quota.
//   */
//   declare type DropboxTypes$team$CustomQuotaError =
//     | DropboxTypes$team$CustomQuotaErrorTooManyUsers
//     | DropboxTypes$team$CustomQuotaErrorOther;

//   /**
//   * User's custom quota.
//   */
//   declare type DropboxTypes$team$CustomQuotaResultSuccess = {
//     ".tag": "success",
//     ...
//   } & DropboxTypes$team$UserCustomQuotaResult;

//   /**
//   * Invalid user (not in team).
//   */
//   declare interface DropboxTypes$team$CustomQuotaResultInvalidUser {
//     ".tag": "invalid_user";
//     invalid_user: DropboxTypes$team$UserSelectorArg;
//   }

//   declare interface DropboxTypes$team$CustomQuotaResultOther {
//     ".tag": "other";
//   }

//   /**
//   * User custom quota.
//   */
//   declare type DropboxTypes$team$CustomQuotaResult =
//     | DropboxTypes$team$CustomQuotaResultSuccess
//     | DropboxTypes$team$CustomQuotaResultInvalidUser
//     | DropboxTypes$team$CustomQuotaResultOther;

//   declare interface DropboxTypes$team$CustomQuotaUsersArg {
//     /**
//     * List of users.
//     */
//     users: Array<DropboxTypes$team$UserSelectorArg>;
//   }

//   /**
//   * Input arguments that can be provided for most reports.
//   */
//   declare interface DropboxTypes$team$DateRange {
//     /**
//     * Optional starting date (inclusive).
//     */
//     start_date?: DropboxTypes$common$Date;

//     /**
//     * Optional ending date (exclusive).
//     */
//     end_date?: DropboxTypes$common$Date;
//   }

//   declare interface DropboxTypes$team$DateRangeErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Errors that can originate from problems in input arguments to reports.
//   */
//   declare type DropboxTypes$team$DateRangeError = DropboxTypes$team$DateRangeErrorOther;

//   /**
//   * Information about linked Dropbox desktop client sessions.
//   */
//   declare type DropboxTypes$team$DesktopClientSession = {
//     /**
//     * Name of the hosting desktop.
//     */
//     host_name: string,

//     /**
//     * The Dropbox desktop client type.
//     */
//     client_type: DropboxTypes$team$DesktopPlatform,

//     /**
//     * The Dropbox client version.
//     */
//     client_version: string,

//     /**
//     * Information on the hosting platform.
//     */
//     platform: string,

//     /**
//     * Whether it's possible to delete all of the account files upon
//     * unlinking.
//     */
//     is_delete_on_unlink_supported: boolean,
//     ...
//   } & DropboxTypes$team$DeviceSession;

//   /**
//   * Official Windows Dropbox desktop client.
//   */
//   declare interface DropboxTypes$team$DesktopPlatformWindows {
//     ".tag": "windows";
//   }

//   /**
//   * Official Mac Dropbox desktop client.
//   */
//   declare interface DropboxTypes$team$DesktopPlatformMac {
//     ".tag": "mac";
//   }

//   /**
//   * Official Linux Dropbox desktop client.
//   */
//   declare interface DropboxTypes$team$DesktopPlatformLinux {
//     ".tag": "linux";
//   }

//   declare interface DropboxTypes$team$DesktopPlatformOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$DesktopPlatform =
//     | DropboxTypes$team$DesktopPlatformWindows
//     | DropboxTypes$team$DesktopPlatformMac
//     | DropboxTypes$team$DesktopPlatformLinux
//     | DropboxTypes$team$DesktopPlatformOther;

//   declare interface DropboxTypes$team$DeviceSession {
//     /**
//     * The session id.
//     */
//     session_id: string;

//     /**
//     * The IP address of the last activity from this session.
//     */
//     ip_address?: string;

//     /**
//     * The country from which the last activity from this session was made.
//     */
//     country?: string;

//     /**
//     * The time this session was created.
//     */
//     created?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The time of the last activity from this session.
//     */
//     updated?: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team$DeviceSessionArg {
//     /**
//     * The session id.
//     */
//     session_id: string;

//     /**
//     * The unique id of the member owning the device.
//     */
//     team_member_id: string;
//   }

//   /**
//   * Each of the items is an array of values, one value per day. The value is
//   * the number of devices active within a time window, ending with that day.
//   * If there is no data for a day, then the value will be None.
//   */
//   declare interface DropboxTypes$team$DevicesActive {
//     /**
//     * Array of number of linked windows (desktop) clients with activity.
//     */
//     windows: DropboxTypes$team$NumberPerDay;

//     /**
//     * Array of number of linked mac (desktop) clients with activity.
//     */
//     macos: DropboxTypes$team$NumberPerDay;

//     /**
//     * Array of number of linked linus (desktop) clients with activity.
//     */
//     linux: DropboxTypes$team$NumberPerDay;

//     /**
//     * Array of number of linked ios devices with activity.
//     */
//     ios: DropboxTypes$team$NumberPerDay;

//     /**
//     * Array of number of linked android devices with activity.
//     */
//     android: DropboxTypes$team$NumberPerDay;

//     /**
//     * Array of number of other linked devices (blackberry, windows phone,
//     * etc)  with activity.
//     */
//     other: DropboxTypes$team$NumberPerDay;

//     /**
//     * Array of total number of linked clients with activity.
//     */
//     total: DropboxTypes$team$NumberPerDay;
//   }

//   /**
//   * Excluded users list argument.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersListArg {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   /**
//   * Excluded users list continue argument.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersListContinueArg {
//     /**
//     * Indicates from what point to get the next set of users.
//     */
//     cursor: string;
//   }

//   /**
//   * The cursor is invalid.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersListContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$team$ExcludedUsersListContinueErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Excluded users list continue error.
//   */
//   declare type DropboxTypes$team$ExcludedUsersListContinueError =
//     | DropboxTypes$team$ExcludedUsersListContinueErrorInvalidCursor
//     | DropboxTypes$team$ExcludedUsersListContinueErrorOther;

//   /**
//   * An error occurred.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersListErrorListError {
//     ".tag": "list_error";
//   }

//   declare interface DropboxTypes$team$ExcludedUsersListErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Excluded users list error.
//   */
//   declare type DropboxTypes$team$ExcludedUsersListError =
//     | DropboxTypes$team$ExcludedUsersListErrorListError
//     | DropboxTypes$team$ExcludedUsersListErrorOther;

//   /**
//   * Excluded users list result.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersListResult {
//     users: Array<DropboxTypes$team$MemberProfile>;

//     /**
//     * Pass the cursor into memberSpaceLimitsExcludedUsersListContinue() to
//     * obtain additional excluded users.
//     */
//     cursor?: string;

//     /**
//     * Is true if there are additional excluded users that have not been
//     * returned yet. An additional call to
//     * memberSpaceLimitsExcludedUsersListContinue() can retrieve them.
//     */
//     has_more: boolean;
//   }

//   /**
//   * Argument of excluded users update operation. Should include a list of
//   * users to add/remove (according to endpoint), Maximum size of the list is
//   * 1000 users.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersUpdateArg {
//     /**
//     * List of users to be added/removed.
//     */
//     users?: Array<DropboxTypes$team$UserSelectorArg>;
//   }

//   /**
//   * At least one of the users is not part of your team.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersUpdateErrorUsersNotInTeam {
//     ".tag": "users_not_in_team";
//   }

//   /**
//   * A maximum of 1000 users for each of addition/removal can be supplied.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersUpdateErrorTooManyUsers {
//     ".tag": "too_many_users";
//   }

//   declare interface DropboxTypes$team$ExcludedUsersUpdateErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Excluded users update error.
//   */
//   declare type DropboxTypes$team$ExcludedUsersUpdateError =
//     | DropboxTypes$team$ExcludedUsersUpdateErrorUsersNotInTeam
//     | DropboxTypes$team$ExcludedUsersUpdateErrorTooManyUsers
//     | DropboxTypes$team$ExcludedUsersUpdateErrorOther;

//   /**
//   * Excluded users update result.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersUpdateResult {
//     /**
//     * Update status.
//     */
//     status: DropboxTypes$team$ExcludedUsersUpdateStatus;
//   }

//   /**
//   * Update successful.
//   */
//   declare interface DropboxTypes$team$ExcludedUsersUpdateStatusSuccess {
//     ".tag": "success";
//   }

//   declare interface DropboxTypes$team$ExcludedUsersUpdateStatusOther {
//     ".tag": "other";
//   }

//   /**
//   * Excluded users update operation status.
//   */
//   declare type DropboxTypes$team$ExcludedUsersUpdateStatus =
//     | DropboxTypes$team$ExcludedUsersUpdateStatusSuccess
//     | DropboxTypes$team$ExcludedUsersUpdateStatusOther;

//   /**
//   * The number of upload API calls allowed per month.
//   */
//   declare interface DropboxTypes$team$FeatureUploadApiRateLimit {
//     ".tag": "upload_api_rate_limit";
//   }

//   /**
//   * Does this team have a shared team root.
//   */
//   declare interface DropboxTypes$team$FeatureHasTeamSharedDropbox {
//     ".tag": "has_team_shared_dropbox";
//   }

//   /**
//   * Does this team have file events.
//   */
//   declare interface DropboxTypes$team$FeatureHasTeamFileEvents {
//     ".tag": "has_team_file_events";
//   }

//   /**
//   * Does this team have team selective sync enabled.
//   */
//   declare interface DropboxTypes$team$FeatureHasTeamSelectiveSync {
//     ".tag": "has_team_selective_sync";
//   }

//   declare interface DropboxTypes$team$FeatureOther {
//     ".tag": "other";
//   }

//   /**
//   * A set of features that a Dropbox Business account may support.
//   */
//   declare type DropboxTypes$team$Feature =
//     | DropboxTypes$team$FeatureUploadApiRateLimit
//     | DropboxTypes$team$FeatureHasTeamSharedDropbox
//     | DropboxTypes$team$FeatureHasTeamFileEvents
//     | DropboxTypes$team$FeatureHasTeamSelectiveSync
//     | DropboxTypes$team$FeatureOther;

//   declare interface DropboxTypes$team$FeatureValueUploadApiRateLimit {
//     ".tag": "upload_api_rate_limit";
//     upload_api_rate_limit: DropboxTypes$team$UploadApiRateLimitValue;
//   }

//   declare interface DropboxTypes$team$FeatureValueHasTeamSharedDropbox {
//     ".tag": "has_team_shared_dropbox";
//     has_team_shared_dropbox: DropboxTypes$team$HasTeamSharedDropboxValue;
//   }

//   declare interface DropboxTypes$team$FeatureValueHasTeamFileEvents {
//     ".tag": "has_team_file_events";
//     has_team_file_events: DropboxTypes$team$HasTeamFileEventsValue;
//   }

//   declare interface DropboxTypes$team$FeatureValueHasTeamSelectiveSync {
//     ".tag": "has_team_selective_sync";
//     has_team_selective_sync: DropboxTypes$team$HasTeamSelectiveSyncValue;
//   }

//   declare interface DropboxTypes$team$FeatureValueOther {
//     ".tag": "other";
//   }

//   /**
//   * The values correspond to entries in team.Feature. You may get different
//   * value according to your Dropbox Business plan.
//   */
//   declare type DropboxTypes$team$FeatureValue =
//     | DropboxTypes$team$FeatureValueUploadApiRateLimit
//     | DropboxTypes$team$FeatureValueHasTeamSharedDropbox
//     | DropboxTypes$team$FeatureValueHasTeamFileEvents
//     | DropboxTypes$team$FeatureValueHasTeamSelectiveSync
//     | DropboxTypes$team$FeatureValueOther;

//   declare interface DropboxTypes$team$FeaturesGetValuesBatchArg {
//     /**
//     * A list of features in team.Feature. If the list is empty, this route
//     * will return team.FeaturesGetValuesBatchError.
//     */
//     features: Array<DropboxTypes$team$Feature>;
//   }

//   /**
//   * At least one team.Feature must be included in the
//   * team.FeaturesGetValuesBatchArg.features list.
//   */
//   declare interface DropboxTypes$team$FeaturesGetValuesBatchErrorEmptyFeaturesList {
//     ".tag": "empty_features_list";
//   }

//   declare interface DropboxTypes$team$FeaturesGetValuesBatchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$FeaturesGetValuesBatchError =
//     | DropboxTypes$team$FeaturesGetValuesBatchErrorEmptyFeaturesList
//     | DropboxTypes$team$FeaturesGetValuesBatchErrorOther;

//   declare interface DropboxTypes$team$FeaturesGetValuesBatchResult {
//     values: Array<DropboxTypes$team$FeatureValue>;
//   }

//   /**
//   * Activity Report Result. Each of the items in the storage report is an
//   * array of values, one value per day. If there is no data for a day, then
//   * the value will be None.
//   */
//   declare type DropboxTypes$team$GetActivityReport = {
//     /**
//     * Array of total number of adds by team members.
//     */
//     adds: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of number of edits by team members. If the same user edits the
//     * same file multiple times this is counted as a single edit.
//     */
//     edits: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of total number of deletes by team members.
//     */
//     deletes: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of users who have been active in the last 28 days.
//     */
//     active_users_28_day: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of users who have been active in the last week.
//     */
//     active_users_7_day: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of users who have been active in the last day.
//     */
//     active_users_1_day: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of shared folders with some activity in the last 28
//     * days.
//     */
//     active_shared_folders_28_day: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of shared folders with some activity in the last
//     * week.
//     */
//     active_shared_folders_7_day: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of shared folders with some activity in the last
//     * day.
//     */
//     active_shared_folders_1_day: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of shared links created.
//     */
//     shared_links_created: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of views by team users to shared links created by
//     * the team.
//     */
//     shared_links_viewed_by_team: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of views by users outside of the team to shared
//     * links created by the team.
//     */
//     shared_links_viewed_by_outside_user: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of views by non-logged-in users to shared links
//     * created by the team.
//     */
//     shared_links_viewed_by_not_logged_in: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the total number of views to shared links created by the team.
//     */
//     shared_links_viewed_total: DropboxTypes$team$NumberPerDay,
//     ...
//   } & DropboxTypes$team$BaseDfbReport;

//   /**
//   * Devices Report Result. Contains subsections for different time ranges of
//   * activity. Each of the items in each subsection of the storage report is
//   * an array of values, one value per day. If there is no data for a day,
//   * then the value will be None.
//   */
//   declare type DropboxTypes$team$GetDevicesReport = {
//     /**
//     * Report of the number of devices active in the last day.
//     */
//     active_1_day: DropboxTypes$team$DevicesActive,

//     /**
//     * Report of the number of devices active in the last 7 days.
//     */
//     active_7_day: DropboxTypes$team$DevicesActive,

//     /**
//     * Report of the number of devices active in the last 28 days.
//     */
//     active_28_day: DropboxTypes$team$DevicesActive,
//     ...
//   } & DropboxTypes$team$BaseDfbReport;

//   /**
//   * Membership Report Result. Each of the items in the storage report is an
//   * array of values, one value per day. If there is no data for a day, then
//   * the value will be None.
//   */
//   declare type DropboxTypes$team$GetMembershipReport = {
//     /**
//     * Team size, for each day.
//     */
//     team_size: DropboxTypes$team$NumberPerDay,

//     /**
//     * The number of pending invites to the team, for each day.
//     */
//     pending_invites: DropboxTypes$team$NumberPerDay,

//     /**
//     * The number of members that joined the team, for each day.
//     */
//     members_joined: DropboxTypes$team$NumberPerDay,

//     /**
//     * The number of suspended team members, for each day.
//     */
//     suspended_members: DropboxTypes$team$NumberPerDay,

//     /**
//     * The total number of licenses the team has, for each day.
//     */
//     licenses: DropboxTypes$team$NumberPerDay,
//     ...
//   } & DropboxTypes$team$BaseDfbReport;

//   /**
//   * Storage Report Result. Each of the items in the storage report is an
//   * array of values, one value per day. If there is no data for a day, then
//   * the value will be None.
//   */
//   declare type DropboxTypes$team$GetStorageReport = {
//     /**
//     * Sum of the shared, unshared, and datastore usages, for each day.
//     */
//     total_usage: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the combined size (bytes) of team members' shared folders, for
//     * each day.
//     */
//     shared_usage: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the combined size (bytes) of team members' root namespaces,
//     * for each day.
//     */
//     unshared_usage: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of the number of shared folders owned by team members, for each
//     * day.
//     */
//     shared_folders: DropboxTypes$team$NumberPerDay,

//     /**
//     * Array of storage summaries of team members' account sizes. Each storage
//     * summary is an array of key, value pairs, where each pair describes a
//     * storage bucket. The key indicates the upper bound of the bucket and the
//     * value is the number of users in that bucket. There is one such summary
//     * per day. If there is no data for a day, the storage summary will be
//     * empty.
//     */
//     member_storage_map: Array<Array<DropboxTypes$team$StorageBucket>>,
//     ...
//   } & DropboxTypes$team$BaseDfbReport;

//   /**
//   * User is a member of the group, but has no special permissions.
//   */
//   declare interface DropboxTypes$team$GroupAccessTypeMember {
//     ".tag": "member";
//   }

//   /**
//   * User can rename the group, and add/remove members.
//   */
//   declare interface DropboxTypes$team$GroupAccessTypeOwner {
//     ".tag": "owner";
//   }

//   /**
//   * Role of a user in group.
//   */
//   declare type DropboxTypes$team$GroupAccessType =
//     | DropboxTypes$team$GroupAccessTypeMember
//     | DropboxTypes$team$GroupAccessTypeOwner;

//   declare interface DropboxTypes$team$GroupCreateArg {
//     /**
//     * Group name.
//     */
//     group_name: string;

//     /**
//     * The creator of a team can associate an arbitrary external ID to the
//     * group.
//     */
//     group_external_id?: DropboxTypes$team_common$GroupExternalId;

//     /**
//     * Whether the team can be managed by selected users, or only by team
//     * admins.
//     */
//     group_management_type?: DropboxTypes$team_common$GroupManagementType;
//   }

//   /**
//   * The requested group name is already being used by another group.
//   */
//   declare interface DropboxTypes$team$GroupCreateErrorGroupNameAlreadyUsed {
//     ".tag": "group_name_already_used";
//   }

//   /**
//   * Group name is empty or has invalid characters.
//   */
//   declare interface DropboxTypes$team$GroupCreateErrorGroupNameInvalid {
//     ".tag": "group_name_invalid";
//   }

//   /**
//   * The requested external ID is already being used by another group.
//   */
//   declare interface DropboxTypes$team$GroupCreateErrorExternalIdAlreadyInUse {
//     ".tag": "external_id_already_in_use";
//   }

//   /**
//   * System-managed group cannot be manually created.
//   */
//   declare interface DropboxTypes$team$GroupCreateErrorSystemManagedGroupDisallowed {
//     ".tag": "system_managed_group_disallowed";
//   }

//   declare interface DropboxTypes$team$GroupCreateErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$GroupCreateError =
//     | DropboxTypes$team$GroupCreateErrorGroupNameAlreadyUsed
//     | DropboxTypes$team$GroupCreateErrorGroupNameInvalid
//     | DropboxTypes$team$GroupCreateErrorExternalIdAlreadyInUse
//     | DropboxTypes$team$GroupCreateErrorSystemManagedGroupDisallowed
//     | DropboxTypes$team$GroupCreateErrorOther;

//   /**
//   * This group has already been deleted.
//   */
//   declare interface DropboxTypes$team$GroupDeleteErrorGroupAlreadyDeleted {
//     ".tag": "group_already_deleted";
//   }

//   declare type DropboxTypes$team$GroupDeleteError =
//     | DropboxTypes$team$GroupSelectorWithTeamGroupError
//     | DropboxTypes$team$GroupDeleteErrorGroupAlreadyDeleted;

//   /**
//   * Full description of a group.
//   */
//   declare type DropboxTypes$team$GroupFullInfo = {
//     /**
//     * List of group members.
//     */
//     members?: Array<DropboxTypes$team$GroupMemberInfo>,

//     /**
//     * The group creation time as a UTC timestamp in milliseconds since the
//     * Unix epoch.
//     */
//     created: number,
//     ...
//   } & DropboxTypes$team_common$GroupSummary;

//   /**
//   * Profile of group member, and role in group.
//   */
//   declare interface DropboxTypes$team$GroupMemberInfo {
//     /**
//     * Profile of group member.
//     */
//     profile: DropboxTypes$team$MemberProfile;

//     /**
//     * The role that the user has in the group.
//     */
//     access_type: DropboxTypes$team$GroupAccessType;
//   }

//   /**
//   * Argument for selecting a group and a single user.
//   */
//   declare interface DropboxTypes$team$GroupMemberSelector {
//     /**
//     * Specify a group.
//     */
//     group: DropboxTypes$team$GroupSelector;

//     /**
//     * Identity of a user that is a member of group.
//     */
//     user: DropboxTypes$team$UserSelectorArg;
//   }

//   /**
//   * The specified user is not a member of this group.
//   */
//   declare interface DropboxTypes$team$GroupMemberSelectorErrorMemberNotInGroup {
//     ".tag": "member_not_in_group";
//   }

//   /**
//   * Error that can be raised when team.GroupMemberSelector is used, and the
//   * user is required to be a member of the specified group.
//   */
//   declare type DropboxTypes$team$GroupMemberSelectorError =
//     | DropboxTypes$team$GroupSelectorWithTeamGroupError
//     | DropboxTypes$team$GroupMemberSelectorErrorMemberNotInGroup;

//   /**
//   * A company managed group cannot be managed by a user.
//   */
//   declare interface DropboxTypes$team$GroupMemberSetAccessTypeErrorUserCannotBeManagerOfCompanyManagedGroup {
//     ".tag": "user_cannot_be_manager_of_company_managed_group";
//   }

//   declare type DropboxTypes$team$GroupMemberSetAccessTypeError =
//     | DropboxTypes$team$GroupMemberSelectorError
//     | DropboxTypes$team$GroupMemberSetAccessTypeErrorUserCannotBeManagerOfCompanyManagedGroup;

//   declare type DropboxTypes$team$GroupMembersAddArg = {
//     /**
//     * Group to which users will be added.
//     */
//     group: DropboxTypes$team$GroupSelector,

//     /**
//     * List of users to be added to the group.
//     */
//     members: Array<DropboxTypes$team$MemberAccess>,
//     ...
//   } & DropboxTypes$team$IncludeMembersArg;

//   /**
//   * You cannot add duplicate users. One or more of the members you are trying
//   * to add is already a member of the group.
//   */
//   declare interface DropboxTypes$team$GroupMembersAddErrorDuplicateUser {
//     ".tag": "duplicate_user";
//   }

//   /**
//   * Group is not in this team. You cannot add members to a group that is
//   * outside of your team.
//   */
//   declare interface DropboxTypes$team$GroupMembersAddErrorGroupNotInTeam {
//     ".tag": "group_not_in_team";
//   }

//   /**
//   * These members are not part of your team. Currently, you cannot add
//   * members to a group if they are not part of your team, though this may
//   * change in a subsequent version. To add new members to your Dropbox
//   * Business team, use the membersAdd() endpoint.
//   */
//   declare interface DropboxTypes$team$GroupMembersAddErrorMembersNotInTeam {
//     ".tag": "members_not_in_team";
//     members_not_in_team: Array<string>;
//   }

//   /**
//   * These users were not found in Dropbox.
//   */
//   declare interface DropboxTypes$team$GroupMembersAddErrorUsersNotFound {
//     ".tag": "users_not_found";
//     users_not_found: Array<string>;
//   }

//   /**
//   * A suspended user cannot be added to a group as GroupAccessType.owner.
//   */
//   declare interface DropboxTypes$team$GroupMembersAddErrorUserMustBeActiveToBeOwner {
//     ".tag": "user_must_be_active_to_be_owner";
//   }

//   /**
//   * A company-managed group cannot be managed by a user.
//   */
//   declare interface DropboxTypes$team$GroupMembersAddErrorUserCannotBeManagerOfCompanyManagedGroup {
//     ".tag": "user_cannot_be_manager_of_company_managed_group";
//     user_cannot_be_manager_of_company_managed_group: Array<string>;
//   }

//   declare type DropboxTypes$team$GroupMembersAddError =
//     | DropboxTypes$team$GroupSelectorWithTeamGroupError
//     | DropboxTypes$team$GroupMembersAddErrorDuplicateUser
//     | DropboxTypes$team$GroupMembersAddErrorGroupNotInTeam
//     | DropboxTypes$team$GroupMembersAddErrorMembersNotInTeam
//     | DropboxTypes$team$GroupMembersAddErrorUsersNotFound
//     | DropboxTypes$team$GroupMembersAddErrorUserMustBeActiveToBeOwner
//     | DropboxTypes$team$GroupMembersAddErrorUserCannotBeManagerOfCompanyManagedGroup;

//   /**
//   * Result returned by groupsMembersAdd() and groupsMembersRemove().
//   */
//   declare interface DropboxTypes$team$GroupMembersChangeResult {
//     /**
//     * The group info after member change operation has been performed.
//     */
//     group_info: DropboxTypes$team$GroupFullInfo;

//     /**
//     * An ID that can be used to obtain the status of granting/revoking
//     * group-owned resources.
//     */
//     async_job_id: DropboxTypes$async$AsyncJobId;
//   }

//   declare type DropboxTypes$team$GroupMembersRemoveArg = {
//     /**
//     * Group from which users will be removed.
//     */
//     group: DropboxTypes$team$GroupSelector,

//     /**
//     * List of users to be removed from the group.
//     */
//     users: Array<DropboxTypes$team$UserSelectorArg>,
//     ...
//   } & DropboxTypes$team$IncludeMembersArg;

//   /**
//   * Group is not in this team. You cannot remove members from a group that is
//   * outside of your team.
//   */
//   declare interface DropboxTypes$team$GroupMembersRemoveErrorGroupNotInTeam {
//     ".tag": "group_not_in_team";
//   }

//   /**
//   * These members are not part of your team.
//   */
//   declare interface DropboxTypes$team$GroupMembersRemoveErrorMembersNotInTeam {
//     ".tag": "members_not_in_team";
//     members_not_in_team: Array<string>;
//   }

//   /**
//   * These users were not found in Dropbox.
//   */
//   declare interface DropboxTypes$team$GroupMembersRemoveErrorUsersNotFound {
//     ".tag": "users_not_found";
//     users_not_found: Array<string>;
//   }

//   declare type DropboxTypes$team$GroupMembersRemoveError =
//     | DropboxTypes$team$GroupMembersSelectorError
//     | DropboxTypes$team$GroupMembersRemoveErrorGroupNotInTeam
//     | DropboxTypes$team$GroupMembersRemoveErrorMembersNotInTeam
//     | DropboxTypes$team$GroupMembersRemoveErrorUsersNotFound;

//   /**
//   * Argument for selecting a group and a list of users.
//   */
//   declare interface DropboxTypes$team$GroupMembersSelector {
//     /**
//     * Specify a group.
//     */
//     group: DropboxTypes$team$GroupSelector;

//     /**
//     * A list of users that are members of group.
//     */
//     users: DropboxTypes$team$UsersSelectorArg;
//   }

//   /**
//   * At least one of the specified users is not a member of the group.
//   */
//   declare interface DropboxTypes$team$GroupMembersSelectorErrorMemberNotInGroup {
//     ".tag": "member_not_in_group";
//   }

//   /**
//   * Error that can be raised when team.GroupMembersSelector is used, and the
//   * users are required to be members of the specified group.
//   */
//   declare type DropboxTypes$team$GroupMembersSelectorError =
//     | DropboxTypes$team$GroupSelectorWithTeamGroupError
//     | DropboxTypes$team$GroupMembersSelectorErrorMemberNotInGroup;

//   declare type DropboxTypes$team$GroupMembersSetAccessTypeArg = {
//     /**
//     * New group access type the user will have.
//     */
//     access_type: DropboxTypes$team$GroupAccessType,

//     /**
//     * Defaults to True.
//     */
//     return_members?: boolean,
//     ...
//   } & DropboxTypes$team$GroupMemberSelector;

//   /**
//   * Group ID.
//   */
//   declare interface DropboxTypes$team$GroupSelectorGroupId {
//     ".tag": "group_id";
//     group_id: DropboxTypes$team_common$GroupId;
//   }

//   /**
//   * External ID of the group.
//   */
//   declare interface DropboxTypes$team$GroupSelectorGroupExternalId {
//     ".tag": "group_external_id";
//     group_external_id: DropboxTypes$team_common$GroupExternalId;
//   }

//   /**
//   * Argument for selecting a single group, either by group_id or by external
//   * group ID.
//   */
//   declare type DropboxTypes$team$GroupSelector =
//     | DropboxTypes$team$GroupSelectorGroupId
//     | DropboxTypes$team$GroupSelectorGroupExternalId;

//   /**
//   * No matching group found. No groups match the specified group ID.
//   */
//   declare interface DropboxTypes$team$GroupSelectorErrorGroupNotFound {
//     ".tag": "group_not_found";
//   }

//   declare interface DropboxTypes$team$GroupSelectorErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error that can be raised when team.GroupSelector is used.
//   */
//   declare type DropboxTypes$team$GroupSelectorError =
//     | DropboxTypes$team$GroupSelectorErrorGroupNotFound
//     | DropboxTypes$team$GroupSelectorErrorOther;

//   /**
//   * This operation is not supported on system-managed groups.
//   */
//   declare interface DropboxTypes$team$GroupSelectorWithTeamGroupErrorSystemManagedGroupDisallowed {
//     ".tag": "system_managed_group_disallowed";
//   }

//   /**
//   * Error that can be raised when team.GroupSelector is used and team groups
//   * are disallowed from being used.
//   */
//   declare type DropboxTypes$team$GroupSelectorWithTeamGroupError =
//     | DropboxTypes$team$GroupSelectorError
//     | DropboxTypes$team$GroupSelectorWithTeamGroupErrorSystemManagedGroupDisallowed;

//   declare type DropboxTypes$team$GroupUpdateArgs = {
//     /**
//     * Specify a group.
//     */
//     group: DropboxTypes$team$GroupSelector,

//     /**
//     * Optional argument. Set group name to this if provided.
//     */
//     new_group_name?: string,

//     /**
//     * Optional argument. New group external ID. If the argument is None, the
//     * group's external_id won't be updated. If the argument is empty string,
//     * the group's external id will be cleared.
//     */
//     new_group_external_id?: DropboxTypes$team_common$GroupExternalId,

//     /**
//     * Set new group management type, if provided.
//     */
//     new_group_management_type?: DropboxTypes$team_common$GroupManagementType,
//     ...
//   } & DropboxTypes$team$IncludeMembersArg;

//   /**
//   * The requested group name is already being used by another group.
//   */
//   declare interface DropboxTypes$team$GroupUpdateErrorGroupNameAlreadyUsed {
//     ".tag": "group_name_already_used";
//   }

//   /**
//   * Group name is empty or has invalid characters.
//   */
//   declare interface DropboxTypes$team$GroupUpdateErrorGroupNameInvalid {
//     ".tag": "group_name_invalid";
//   }

//   /**
//   * The requested external ID is already being used by another group.
//   */
//   declare interface DropboxTypes$team$GroupUpdateErrorExternalIdAlreadyInUse {
//     ".tag": "external_id_already_in_use";
//   }

//   declare type DropboxTypes$team$GroupUpdateError =
//     | DropboxTypes$team$GroupSelectorWithTeamGroupError
//     | DropboxTypes$team$GroupUpdateErrorGroupNameAlreadyUsed
//     | DropboxTypes$team$GroupUpdateErrorGroupNameInvalid
//     | DropboxTypes$team$GroupUpdateErrorExternalIdAlreadyInUse;

//   /**
//   * The group is not on your team.
//   */
//   declare interface DropboxTypes$team$GroupsGetInfoErrorGroupNotOnTeam {
//     ".tag": "group_not_on_team";
//   }

//   declare interface DropboxTypes$team$GroupsGetInfoErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$GroupsGetInfoError =
//     | DropboxTypes$team$GroupsGetInfoErrorGroupNotOnTeam
//     | DropboxTypes$team$GroupsGetInfoErrorOther;

//   /**
//   * An ID that was provided as a parameter to groupsGetInfo(), and did not
//   * match a corresponding group. The ID can be a group ID, or an external ID,
//   * depending on how the method was called.
//   */
//   declare interface DropboxTypes$team$GroupsGetInfoItemIdNotFound {
//     ".tag": "id_not_found";
//     id_not_found: string;
//   }

//   /**
//   * Info about a group.
//   */
//   declare type DropboxTypes$team$GroupsGetInfoItemGroupInfo = {
//     ".tag": "group_info",
//     ...
//   } & DropboxTypes$team$GroupFullInfo;

//   declare type DropboxTypes$team$GroupsGetInfoItem =
//     | DropboxTypes$team$GroupsGetInfoItemIdNotFound
//     | DropboxTypes$team$GroupsGetInfoItemGroupInfo;

//   declare interface DropboxTypes$team$GroupsListArg {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$team$GroupsListContinueArg {
//     /**
//     * Indicates from what point to get the next set of groups.
//     */
//     cursor: string;
//   }

//   /**
//   * The cursor is invalid.
//   */
//   declare interface DropboxTypes$team$GroupsListContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$team$GroupsListContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$GroupsListContinueError =
//     | DropboxTypes$team$GroupsListContinueErrorInvalidCursor
//     | DropboxTypes$team$GroupsListContinueErrorOther;

//   declare interface DropboxTypes$team$GroupsListResult {
//     groups: Array<DropboxTypes$team_common$GroupSummary>;

//     /**
//     * Pass the cursor into groupsListContinue() to obtain the additional
//     * groups.
//     */
//     cursor: string;

//     /**
//     * Is true if there are additional groups that have not been returned yet.
//     * An additional call to groupsListContinue() can retrieve them.
//     */
//     has_more: boolean;
//   }

//   declare interface DropboxTypes$team$GroupsMembersListArg {
//     /**
//     * The group whose members are to be listed.
//     */
//     group: DropboxTypes$team$GroupSelector;

//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$team$GroupsMembersListContinueArg {
//     /**
//     * Indicates from what point to get the next set of groups.
//     */
//     cursor: string;
//   }

//   /**
//   * The cursor is invalid.
//   */
//   declare interface DropboxTypes$team$GroupsMembersListContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$team$GroupsMembersListContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$GroupsMembersListContinueError =
//     | DropboxTypes$team$GroupsMembersListContinueErrorInvalidCursor
//     | DropboxTypes$team$GroupsMembersListContinueErrorOther;

//   declare interface DropboxTypes$team$GroupsMembersListResult {
//     members: Array<DropboxTypes$team$GroupMemberInfo>;

//     /**
//     * Pass the cursor into groupsMembersListContinue() to obtain additional
//     * group members.
//     */
//     cursor: string;

//     /**
//     * Is true if there are additional group members that have not been
//     * returned yet. An additional call to groupsMembersListContinue() can
//     * retrieve them.
//     */
//     has_more: boolean;
//   }

//   /**
//   * You are not allowed to poll this job.
//   */
//   declare interface DropboxTypes$team$GroupsPollErrorAccessDenied {
//     ".tag": "access_denied";
//   }

//   declare type DropboxTypes$team$GroupsPollError =
//     | DropboxTypes$async$PollError
//     | DropboxTypes$team$GroupsPollErrorAccessDenied;

//   /**
//   * List of group IDs.
//   */
//   declare interface DropboxTypes$team$GroupsSelectorGroupIds {
//     ".tag": "group_ids";
//     group_ids: Array<DropboxTypes$team_common$GroupId>;
//   }

//   /**
//   * List of external IDs of groups.
//   */
//   declare interface DropboxTypes$team$GroupsSelectorGroupExternalIds {
//     ".tag": "group_external_ids";
//     group_external_ids: Array<string>;
//   }

//   /**
//   * Argument for selecting a list of groups, either by group_ids, or external
//   * group IDs.
//   */
//   declare type DropboxTypes$team$GroupsSelector =
//     | DropboxTypes$team$GroupsSelectorGroupIds
//     | DropboxTypes$team$GroupsSelectorGroupExternalIds;

//   /**
//   * Does this team have file events.
//   */
//   declare interface DropboxTypes$team$HasTeamFileEventsValueEnabled {
//     ".tag": "enabled";
//     enabled: boolean;
//   }

//   declare interface DropboxTypes$team$HasTeamFileEventsValueOther {
//     ".tag": "other";
//   }

//   /**
//   * The value for Feature.has_team_file_events.
//   */
//   declare type DropboxTypes$team$HasTeamFileEventsValue =
//     | DropboxTypes$team$HasTeamFileEventsValueEnabled
//     | DropboxTypes$team$HasTeamFileEventsValueOther;

//   /**
//   * Does this team have team selective sync enabled.
//   */
//   declare interface DropboxTypes$team$HasTeamSelectiveSyncValueHasTeamSelectiveSync {
//     ".tag": "has_team_selective_sync";
//     has_team_selective_sync: boolean;
//   }

//   declare interface DropboxTypes$team$HasTeamSelectiveSyncValueOther {
//     ".tag": "other";
//   }

//   /**
//   * The value for Feature.has_team_selective_sync.
//   */
//   declare type DropboxTypes$team$HasTeamSelectiveSyncValue =
//     | DropboxTypes$team$HasTeamSelectiveSyncValueHasTeamSelectiveSync
//     | DropboxTypes$team$HasTeamSelectiveSyncValueOther;

//   /**
//   * Does this team have a shared team root.
//   */
//   declare interface DropboxTypes$team$HasTeamSharedDropboxValueHasTeamSharedDropbox {
//     ".tag": "has_team_shared_dropbox";
//     has_team_shared_dropbox: boolean;
//   }

//   declare interface DropboxTypes$team$HasTeamSharedDropboxValueOther {
//     ".tag": "other";
//   }

//   /**
//   * The value for Feature.has_team_shared_dropbox.
//   */
//   declare type DropboxTypes$team$HasTeamSharedDropboxValue =
//     | DropboxTypes$team$HasTeamSharedDropboxValueHasTeamSharedDropbox
//     | DropboxTypes$team$HasTeamSharedDropboxValueOther;

//   declare interface DropboxTypes$team$IncludeMembersArg {
//     /**
//     * Defaults to True.
//     */
//     return_members?: boolean;
//   }

//   declare interface DropboxTypes$team$ListMemberAppsArg {
//     /**
//     * The team member id.
//     */
//     team_member_id: string;
//   }

//   /**
//   * Member not found.
//   */
//   declare interface DropboxTypes$team$ListMemberAppsErrorMemberNotFound {
//     ".tag": "member_not_found";
//   }

//   declare interface DropboxTypes$team$ListMemberAppsErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned by linkedAppsListMemberLinkedApps().
//   */
//   declare type DropboxTypes$team$ListMemberAppsError =
//     | DropboxTypes$team$ListMemberAppsErrorMemberNotFound
//     | DropboxTypes$team$ListMemberAppsErrorOther;

//   declare interface DropboxTypes$team$ListMemberAppsResult {
//     /**
//     * List of third party applications linked by this team member.
//     */
//     linked_api_apps: Array<DropboxTypes$team$ApiApp>;
//   }

//   declare interface DropboxTypes$team$ListMemberDevicesArg {
//     /**
//     * The team's member id.
//     */
//     team_member_id: string;

//     /**
//     * Defaults to True.
//     */
//     include_web_sessions?: boolean;

//     /**
//     * Defaults to True.
//     */
//     include_desktop_clients?: boolean;

//     /**
//     * Defaults to True.
//     */
//     include_mobile_clients?: boolean;
//   }

//   /**
//   * Member not found.
//   */
//   declare interface DropboxTypes$team$ListMemberDevicesErrorMemberNotFound {
//     ".tag": "member_not_found";
//   }

//   declare interface DropboxTypes$team$ListMemberDevicesErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$ListMemberDevicesError =
//     | DropboxTypes$team$ListMemberDevicesErrorMemberNotFound
//     | DropboxTypes$team$ListMemberDevicesErrorOther;

//   declare interface DropboxTypes$team$ListMemberDevicesResult {
//     /**
//     * List of web sessions made by this team member.
//     */
//     active_web_sessions?: Array<DropboxTypes$team$ActiveWebSession>;

//     /**
//     * List of desktop clients used by this team member.
//     */
//     desktop_client_sessions?: Array<DropboxTypes$team$DesktopClientSession>;

//     /**
//     * List of mobile client used by this team member.
//     */
//     mobile_client_sessions?: Array<DropboxTypes$team$MobileClientSession>;
//   }

//   /**
//   * Arguments for linkedAppsListMembersLinkedApps().
//   */
//   declare interface DropboxTypes$team$ListMembersAppsArg {
//     /**
//     * At the first call to the linkedAppsListMembersLinkedApps() the cursor
//     * shouldn't be passed. Then, if the result of the call includes a cursor,
//     * the following requests should include the received cursors in order to
//     * receive the next sub list of the team applications.
//     */
//     cursor?: string;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call
//   * linkedAppsListMembersLinkedApps() again with an empty cursor to obtain a
//   * new cursor.
//   */
//   declare interface DropboxTypes$team$ListMembersAppsErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$team$ListMembersAppsErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned by linkedAppsListMembersLinkedApps().
//   */
//   declare type DropboxTypes$team$ListMembersAppsError =
//     | DropboxTypes$team$ListMembersAppsErrorReset
//     | DropboxTypes$team$ListMembersAppsErrorOther;

//   /**
//   * Information returned by linkedAppsListMembersLinkedApps().
//   */
//   declare interface DropboxTypes$team$ListMembersAppsResult {
//     /**
//     * The linked applications of each member of the team.
//     */
//     apps: Array<DropboxTypes$team$MemberLinkedApps>;

//     /**
//     * If true, then there are more apps available. Pass the cursor to
//     * linkedAppsListMembersLinkedApps() to retrieve the rest.
//     */
//     has_more: boolean;

//     /**
//     * Pass the cursor into linkedAppsListMembersLinkedApps() to receive the
//     * next sub list of team's applications.
//     */
//     cursor?: string;
//   }

//   declare interface DropboxTypes$team$ListMembersDevicesArg {
//     /**
//     * At the first call to the devicesListMembersDevices() the cursor
//     * shouldn't be passed. Then, if the result of the call includes a cursor,
//     * the following requests should include the received cursors in order to
//     * receive the next sub list of team devices.
//     */
//     cursor?: string;

//     /**
//     * Defaults to True.
//     */
//     include_web_sessions?: boolean;

//     /**
//     * Defaults to True.
//     */
//     include_desktop_clients?: boolean;

//     /**
//     * Defaults to True.
//     */
//     include_mobile_clients?: boolean;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call
//   * devicesListMembersDevices() again with an empty cursor to obtain a new
//   * cursor.
//   */
//   declare interface DropboxTypes$team$ListMembersDevicesErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$team$ListMembersDevicesErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$ListMembersDevicesError =
//     | DropboxTypes$team$ListMembersDevicesErrorReset
//     | DropboxTypes$team$ListMembersDevicesErrorOther;

//   declare interface DropboxTypes$team$ListMembersDevicesResult {
//     /**
//     * The devices of each member of the team.
//     */
//     devices: Array<DropboxTypes$team$MemberDevices>;

//     /**
//     * If true, then there are more devices available. Pass the cursor to
//     * devicesListMembersDevices() to retrieve the rest.
//     */
//     has_more: boolean;

//     /**
//     * Pass the cursor into devicesListMembersDevices() to receive the next
//     * sub list of team's devices.
//     */
//     cursor?: string;
//   }

//   /**
//   * Arguments for linkedAppsListTeamLinkedApps().
//   */
//   declare interface DropboxTypes$team$ListTeamAppsArg {
//     /**
//     * At the first call to the linkedAppsListTeamLinkedApps() the cursor
//     * shouldn't be passed. Then, if the result of the call includes a cursor,
//     * the following requests should include the received cursors in order to
//     * receive the next sub list of the team applications.
//     */
//     cursor?: string;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call
//   * linkedAppsListTeamLinkedApps() again with an empty cursor to obtain a new
//   * cursor.
//   */
//   declare interface DropboxTypes$team$ListTeamAppsErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$team$ListTeamAppsErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned by linkedAppsListTeamLinkedApps().
//   */
//   declare type DropboxTypes$team$ListTeamAppsError =
//     | DropboxTypes$team$ListTeamAppsErrorReset
//     | DropboxTypes$team$ListTeamAppsErrorOther;

//   /**
//   * Information returned by linkedAppsListTeamLinkedApps().
//   */
//   declare interface DropboxTypes$team$ListTeamAppsResult {
//     /**
//     * The linked applications of each member of the team.
//     */
//     apps: Array<DropboxTypes$team$MemberLinkedApps>;

//     /**
//     * If true, then there are more apps available. Pass the cursor to
//     * linkedAppsListTeamLinkedApps() to retrieve the rest.
//     */
//     has_more: boolean;

//     /**
//     * Pass the cursor into linkedAppsListTeamLinkedApps() to receive the next
//     * sub list of team's applications.
//     */
//     cursor?: string;
//   }

//   declare interface DropboxTypes$team$ListTeamDevicesArg {
//     /**
//     * At the first call to the devicesListTeamDevices() the cursor shouldn't
//     * be passed. Then, if the result of the call includes a cursor, the
//     * following requests should include the received cursors in order to
//     * receive the next sub list of team devices.
//     */
//     cursor?: string;

//     /**
//     * Defaults to True.
//     */
//     include_web_sessions?: boolean;

//     /**
//     * Defaults to True.
//     */
//     include_desktop_clients?: boolean;

//     /**
//     * Defaults to True.
//     */
//     include_mobile_clients?: boolean;
//   }

//   /**
//   * Indicates that the cursor has been invalidated. Call
//   * devicesListTeamDevices() again with an empty cursor to obtain a new
//   * cursor.
//   */
//   declare interface DropboxTypes$team$ListTeamDevicesErrorReset {
//     ".tag": "reset";
//   }

//   declare interface DropboxTypes$team$ListTeamDevicesErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$ListTeamDevicesError =
//     | DropboxTypes$team$ListTeamDevicesErrorReset
//     | DropboxTypes$team$ListTeamDevicesErrorOther;

//   declare interface DropboxTypes$team$ListTeamDevicesResult {
//     /**
//     * The devices of each member of the team.
//     */
//     devices: Array<DropboxTypes$team$MemberDevices>;

//     /**
//     * If true, then there are more devices available. Pass the cursor to
//     * devicesListTeamDevices() to retrieve the rest.
//     */
//     has_more: boolean;

//     /**
//     * Pass the cursor into devicesListTeamDevices() to receive the next sub
//     * list of team's devices.
//     */
//     cursor?: string;
//   }

//   /**
//   * Specify access type a member should have when joined to a group.
//   */
//   declare interface DropboxTypes$team$MemberAccess {
//     /**
//     * Identity of a user.
//     */
//     user: DropboxTypes$team$UserSelectorArg;

//     /**
//     * Access type.
//     */
//     access_type: DropboxTypes$team$GroupAccessType;
//   }

//   declare interface DropboxTypes$team$MemberAddArg {
//     member_email: DropboxTypes$common$EmailAddress;

//     /**
//     * Member's first name.
//     */
//     member_given_name?: DropboxTypes$common$OptionalNamePart;

//     /**
//     * Member's last name.
//     */
//     member_surname?: DropboxTypes$common$OptionalNamePart;

//     /**
//     * External ID for member.
//     */
//     member_external_id?: DropboxTypes$team_common$MemberExternalId;

//     /**
//     * Persistent ID for member. This field is only available to teams using
//     * persistent ID SAML configuration.
//     */
//     member_persistent_id?: string;

//     /**
//     * Defaults to True.
//     */
//     send_welcome_email?: boolean;

//     /**
//     * Defaults to TagRef(Union(u'AdminTier', [UnionField(u'team_admin', Void,
//     * False, None), UnionField(u'user_management_admin', Void, False, None),
//     * UnionField(u'support_admin', Void, False, None),
//     * UnionField(u'member_only', Void, False, None)]), u'member_only').
//     */
//     role?: DropboxTypes$team$AdminTier;

//     /**
//     * Whether a user is directory restricted.
//     */
//     is_directory_restricted?: boolean;
//   }

//   /**
//   * Describes a user that was successfully added to the team.
//   */
//   declare type DropboxTypes$team$MemberAddResultSuccess = {
//     ".tag": "success",
//     ...
//   } & DropboxTypes$team$TeamMemberInfo;

//   /**
//   * Team is already full. The organization has no available licenses.
//   */
//   declare interface DropboxTypes$team$MemberAddResultTeamLicenseLimit {
//     ".tag": "team_license_limit";
//     team_license_limit: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * Team is already full. The free team member limit has been reached.
//   */
//   declare interface DropboxTypes$team$MemberAddResultFreeTeamMemberLimitReached {
//     ".tag": "free_team_member_limit_reached";
//     free_team_member_limit_reached: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * User is already on this team. The provided email address is associated
//   * with a user who is already a member of (including in recoverable state)
//   * or invited to the team.
//   */
//   declare interface DropboxTypes$team$MemberAddResultUserAlreadyOnTeam {
//     ".tag": "user_already_on_team";
//     user_already_on_team: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * User is already on another team. The provided email address is associated
//   * with a user that is already a member or invited to another team.
//   */
//   declare interface DropboxTypes$team$MemberAddResultUserOnAnotherTeam {
//     ".tag": "user_on_another_team";
//     user_on_another_team: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * User is already paired.
//   */
//   declare interface DropboxTypes$team$MemberAddResultUserAlreadyPaired {
//     ".tag": "user_already_paired";
//     user_already_paired: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * User migration has failed.
//   */
//   declare interface DropboxTypes$team$MemberAddResultUserMigrationFailed {
//     ".tag": "user_migration_failed";
//     user_migration_failed: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * A user with the given external member ID already exists on the team
//   * (including in recoverable state).
//   */
//   declare interface DropboxTypes$team$MemberAddResultDuplicateExternalMemberId {
//     ".tag": "duplicate_external_member_id";
//     duplicate_external_member_id: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * A user with the given persistent ID already exists on the team (including
//   * in recoverable state).
//   */
//   declare interface DropboxTypes$team$MemberAddResultDuplicateMemberPersistentId {
//     ".tag": "duplicate_member_persistent_id";
//     duplicate_member_persistent_id: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * Persistent ID is only available to teams with persistent ID SAML
//   * configuration. Please contact Dropbox for more information.
//   */
//   declare interface DropboxTypes$team$MemberAddResultPersistentIdDisabled {
//     ".tag": "persistent_id_disabled";
//     persistent_id_disabled: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * User creation has failed.
//   */
//   declare interface DropboxTypes$team$MemberAddResultUserCreationFailed {
//     ".tag": "user_creation_failed";
//     user_creation_failed: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * Describes the result of attempting to add a single user to the team.
//   * 'success' is the only value indicating that a user was indeed added to
//   * the team - the other values explain the type of failure that occurred,
//   * and include the email of the user for which the operation has failed.
//   */
//   declare type DropboxTypes$team$MemberAddResult =
//     | DropboxTypes$team$MemberAddResultSuccess
//     | DropboxTypes$team$MemberAddResultTeamLicenseLimit
//     | DropboxTypes$team$MemberAddResultFreeTeamMemberLimitReached
//     | DropboxTypes$team$MemberAddResultUserAlreadyOnTeam
//     | DropboxTypes$team$MemberAddResultUserOnAnotherTeam
//     | DropboxTypes$team$MemberAddResultUserAlreadyPaired
//     | DropboxTypes$team$MemberAddResultUserMigrationFailed
//     | DropboxTypes$team$MemberAddResultDuplicateExternalMemberId
//     | DropboxTypes$team$MemberAddResultDuplicateMemberPersistentId
//     | DropboxTypes$team$MemberAddResultPersistentIdDisabled
//     | DropboxTypes$team$MemberAddResultUserCreationFailed;

//   /**
//   * Information on devices of a team's member.
//   */
//   declare interface DropboxTypes$team$MemberDevices {
//     /**
//     * The member unique Id.
//     */
//     team_member_id: string;

//     /**
//     * List of web sessions made by this team member.
//     */
//     web_sessions?: Array<DropboxTypes$team$ActiveWebSession>;

//     /**
//     * List of desktop clients by this team member.
//     */
//     desktop_clients?: Array<DropboxTypes$team$DesktopClientSession>;

//     /**
//     * List of mobile clients by this team member.
//     */
//     mobile_clients?: Array<DropboxTypes$team$MobileClientSession>;
//   }

//   /**
//   * Information on linked applications of a team member.
//   */
//   declare interface DropboxTypes$team$MemberLinkedApps {
//     /**
//     * The member unique Id.
//     */
//     team_member_id: string;

//     /**
//     * List of third party applications linked by this team member.
//     */
//     linked_api_apps: Array<DropboxTypes$team$ApiApp>;
//   }

//   /**
//   * Basic member profile.
//   */
//   declare interface DropboxTypes$team$MemberProfile {
//     /**
//     * ID of user as a member of a team.
//     */
//     team_member_id: DropboxTypes$team_common$TeamMemberId;

//     /**
//     * External ID that a team can attach to the user. An application using
//     * the API may find it easier to use their own IDs instead of Dropbox IDs
//     * like account_id or team_member_id.
//     */
//     external_id?: string;

//     /**
//     * A user's account identifier.
//     */
//     account_id?: DropboxTypes$users_common$AccountId;

//     /**
//     * Email address of user.
//     */
//     email: string;

//     /**
//     * Is true if the user's email is verified to be owned by the user.
//     */
//     email_verified: boolean;

//     /**
//     * The user's status as a member of a specific team.
//     */
//     status: DropboxTypes$team$TeamMemberStatus;

//     /**
//     * Representations for a person's name.
//     */
//     name: DropboxTypes$users$Name;

//     /**
//     * The user's membership type: full (normal team member) vs limited (does
//     * not use a license; no access to the team's shared quota).
//     */
//     membership_type: DropboxTypes$team$TeamMembershipType;

//     /**
//     * The date and time the user joined as a member of a specific team.
//     */
//     joined_on?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The date and time the user was suspended from the team (contains value
//     * only when the member's status matches TeamMemberStatus.suspended.
//     */
//     suspended_on?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * Persistent ID that a team can attach to the user. The persistent ID is
//     * unique ID to be used for SAML authentication.
//     */
//     persistent_id?: string;

//     /**
//     * Whether the user is a directory restricted user.
//     */
//     is_directory_restricted?: boolean;

//     /**
//     * URL for the photo representing the user, if one is set.
//     */
//     profile_photo_url?: string;
//   }

//   /**
//   * The user is not a member of the team.
//   */
//   declare interface DropboxTypes$team$MemberSelectorErrorUserNotInTeam {
//     ".tag": "user_not_in_team";
//   }

//   declare type DropboxTypes$team$MemberSelectorError =
//     | DropboxTypes$team$UserSelectorError
//     | DropboxTypes$team$MemberSelectorErrorUserNotInTeam;

//   declare interface DropboxTypes$team$MembersAddArg {
//     /**
//     * Details of new members to be added to the team.
//     */
//     new_members: Array<DropboxTypes$team$MemberAddArg>;

//     /**
//     * Defaults to False.
//     */
//     force_async?: boolean;
//   }

//   /**
//   * The asynchronous job has finished. For each member that was specified in
//   * the parameter team.MembersAddArg that was provided to membersAdd(), a
//   * corresponding item is returned in this list.
//   */
//   declare interface DropboxTypes$team$MembersAddJobStatusComplete {
//     ".tag": "complete";
//     complete: Array<DropboxTypes$team$MemberAddResult>;
//   }

//   /**
//   * The asynchronous job returned an error. The string contains an error
//   * message.
//   */
//   declare interface DropboxTypes$team$MembersAddJobStatusFailed {
//     ".tag": "failed";
//     failed: string;
//   }

//   declare type DropboxTypes$team$MembersAddJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$team$MembersAddJobStatusComplete
//     | DropboxTypes$team$MembersAddJobStatusFailed;

//   declare interface DropboxTypes$team$MembersAddLaunchComplete {
//     ".tag": "complete";
//     complete: Array<DropboxTypes$team$MemberAddResult>;
//   }

//   declare type DropboxTypes$team$MembersAddLaunch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$team$MembersAddLaunchComplete;

//   declare type DropboxTypes$team$MembersDataTransferArg = {
//     /**
//     * Files from the deleted member account will be transferred to this user.
//     */
//     transfer_dest_id: DropboxTypes$team$UserSelectorArg,

//     /**
//     * Errors during the transfer process will be sent via email to this user.
//     */
//     transfer_admin_id: DropboxTypes$team$UserSelectorArg,
//     ...
//   } & DropboxTypes$team$MembersDeactivateBaseArg;

//   declare type DropboxTypes$team$MembersDeactivateArg = {
//     /**
//     * Defaults to True.
//     */
//     wipe_data?: boolean,
//     ...
//   } & DropboxTypes$team$MembersDeactivateBaseArg;

//   /**
//   * Exactly one of team_member_id, email, or external_id must be provided to
//   * identify the user account.
//   */
//   declare interface DropboxTypes$team$MembersDeactivateBaseArg {
//     /**
//     * Identity of user to remove/suspend/have their files moved.
//     */
//     user: DropboxTypes$team$UserSelectorArg;
//   }

//   /**
//   * The user is not a member of the team.
//   */
//   declare interface DropboxTypes$team$MembersDeactivateErrorUserNotInTeam {
//     ".tag": "user_not_in_team";
//   }

//   declare interface DropboxTypes$team$MembersDeactivateErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersDeactivateError =
//     | DropboxTypes$team$UserSelectorError
//     | DropboxTypes$team$MembersDeactivateErrorUserNotInTeam
//     | DropboxTypes$team$MembersDeactivateErrorOther;

//   declare interface DropboxTypes$team$MembersGetInfoArgs {
//     /**
//     * List of team members.
//     */
//     members: Array<DropboxTypes$team$UserSelectorArg>;
//   }

//   declare interface DropboxTypes$team$MembersGetInfoErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersGetInfoError = DropboxTypes$team$MembersGetInfoErrorOther;

//   /**
//   * An ID that was provided as a parameter to membersGetInfo(), and did not
//   * match a corresponding user. This might be a team_member_id, an email, or
//   * an external ID, depending on how the method was called.
//   */
//   declare interface DropboxTypes$team$MembersGetInfoItemIdNotFound {
//     ".tag": "id_not_found";
//     id_not_found: string;
//   }

//   /**
//   * Info about a team member.
//   */
//   declare type DropboxTypes$team$MembersGetInfoItemMemberInfo = {
//     ".tag": "member_info",
//     ...
//   } & DropboxTypes$team$TeamMemberInfo;

//   /**
//   * Describes a result obtained for a single user whose id was specified in
//   * the parameter of membersGetInfo().
//   */
//   declare type DropboxTypes$team$MembersGetInfoItem =
//     | DropboxTypes$team$MembersGetInfoItemIdNotFound
//     | DropboxTypes$team$MembersGetInfoItemMemberInfo;

//   declare interface DropboxTypes$team$MembersListArg {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;

//     /**
//     * Defaults to False.
//     */
//     include_removed?: boolean;
//   }

//   declare interface DropboxTypes$team$MembersListContinueArg {
//     /**
//     * Indicates from what point to get the next set of members.
//     */
//     cursor: string;
//   }

//   /**
//   * The cursor is invalid.
//   */
//   declare interface DropboxTypes$team$MembersListContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$team$MembersListContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersListContinueError =
//     | DropboxTypes$team$MembersListContinueErrorInvalidCursor
//     | DropboxTypes$team$MembersListContinueErrorOther;

//   declare interface DropboxTypes$team$MembersListErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersListError = DropboxTypes$team$MembersListErrorOther;

//   declare interface DropboxTypes$team$MembersListResult {
//     /**
//     * List of team members.
//     */
//     members: Array<DropboxTypes$team$TeamMemberInfo>;

//     /**
//     * Pass the cursor into membersListContinue() to obtain the additional
//     * members.
//     */
//     cursor: string;

//     /**
//     * Is true if there are additional team members that have not been
//     * returned yet. An additional call to membersListContinue() can retrieve
//     * them.
//     */
//     has_more: boolean;
//   }

//   /**
//   * Exactly one of team_member_id, email, or external_id must be provided to
//   * identify the user account.
//   */
//   declare interface DropboxTypes$team$MembersRecoverArg {
//     /**
//     * Identity of user to recover.
//     */
//     user: DropboxTypes$team$UserSelectorArg;
//   }

//   /**
//   * The user is not recoverable.
//   */
//   declare interface DropboxTypes$team$MembersRecoverErrorUserUnrecoverable {
//     ".tag": "user_unrecoverable";
//   }

//   /**
//   * The user is not a member of the team.
//   */
//   declare interface DropboxTypes$team$MembersRecoverErrorUserNotInTeam {
//     ".tag": "user_not_in_team";
//   }

//   /**
//   * Team is full. The organization has no available licenses.
//   */
//   declare interface DropboxTypes$team$MembersRecoverErrorTeamLicenseLimit {
//     ".tag": "team_license_limit";
//   }

//   declare interface DropboxTypes$team$MembersRecoverErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersRecoverError =
//     | DropboxTypes$team$UserSelectorError
//     | DropboxTypes$team$MembersRecoverErrorUserUnrecoverable
//     | DropboxTypes$team$MembersRecoverErrorUserNotInTeam
//     | DropboxTypes$team$MembersRecoverErrorTeamLicenseLimit
//     | DropboxTypes$team$MembersRecoverErrorOther;

//   declare type DropboxTypes$team$MembersRemoveArg = {
//     /**
//     * If provided, files from the deleted member account will be transferred
//     * to this user.
//     */
//     transfer_dest_id?: DropboxTypes$team$UserSelectorArg,

//     /**
//     * If provided, errors during the transfer process will be sent via email
//     * to this user. If the transfer_dest_id argument was provided, then this
//     * argument must be provided as well.
//     */
//     transfer_admin_id?: DropboxTypes$team$UserSelectorArg,

//     /**
//     * Defaults to False.
//     */
//     keep_account?: boolean,
//     ...
//   } & DropboxTypes$team$MembersDeactivateArg;

//   /**
//   * The user is the last admin of the team, so it cannot be removed from it.
//   */
//   declare interface DropboxTypes$team$MembersRemoveErrorRemoveLastAdmin {
//     ".tag": "remove_last_admin";
//   }

//   /**
//   * Cannot keep account and transfer the data to another user at the same
//   * time.
//   */
//   declare interface DropboxTypes$team$MembersRemoveErrorCannotKeepAccountAndTransfer {
//     ".tag": "cannot_keep_account_and_transfer";
//   }

//   /**
//   * Cannot keep account and delete the data at the same time. To keep the
//   * account the argument wipe_data should be set to False.
//   */
//   declare interface DropboxTypes$team$MembersRemoveErrorCannotKeepAccountAndDeleteData {
//     ".tag": "cannot_keep_account_and_delete_data";
//   }

//   /**
//   * The email address of the user is too long to be disabled.
//   */
//   declare interface DropboxTypes$team$MembersRemoveErrorEmailAddressTooLongToBeDisabled {
//     ".tag": "email_address_too_long_to_be_disabled";
//   }

//   /**
//   * Cannot keep account of an invited user.
//   */
//   declare interface DropboxTypes$team$MembersRemoveErrorCannotKeepInvitedUserAccount {
//     ".tag": "cannot_keep_invited_user_account";
//   }

//   declare type DropboxTypes$team$MembersRemoveError =
//     | DropboxTypes$team$MembersTransferFilesError
//     | DropboxTypes$team$MembersRemoveErrorRemoveLastAdmin
//     | DropboxTypes$team$MembersRemoveErrorCannotKeepAccountAndTransfer
//     | DropboxTypes$team$MembersRemoveErrorCannotKeepAccountAndDeleteData
//     | DropboxTypes$team$MembersRemoveErrorEmailAddressTooLongToBeDisabled
//     | DropboxTypes$team$MembersRemoveErrorCannotKeepInvitedUserAccount;

//   declare interface DropboxTypes$team$MembersSendWelcomeErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersSendWelcomeError =
//     | DropboxTypes$team$MemberSelectorError
//     | DropboxTypes$team$MembersSendWelcomeErrorOther;

//   /**
//   * Exactly one of team_member_id, email, or external_id must be provided to
//   * identify the user account.
//   */
//   declare interface DropboxTypes$team$MembersSetPermissionsArg {
//     /**
//     * Identity of user whose role will be set.
//     */
//     user: DropboxTypes$team$UserSelectorArg;

//     /**
//     * The new role of the member.
//     */
//     new_role: DropboxTypes$team$AdminTier;
//   }

//   /**
//   * Cannot remove the admin setting of the last admin.
//   */
//   declare interface DropboxTypes$team$MembersSetPermissionsErrorLastAdmin {
//     ".tag": "last_admin";
//   }

//   /**
//   * The user is not a member of the team.
//   */
//   declare interface DropboxTypes$team$MembersSetPermissionsErrorUserNotInTeam {
//     ".tag": "user_not_in_team";
//   }

//   /**
//   * Cannot remove/grant permissions.
//   */
//   declare interface DropboxTypes$team$MembersSetPermissionsErrorCannotSetPermissions {
//     ".tag": "cannot_set_permissions";
//   }

//   /**
//   * Team is full. The organization has no available licenses.
//   */
//   declare interface DropboxTypes$team$MembersSetPermissionsErrorTeamLicenseLimit {
//     ".tag": "team_license_limit";
//   }

//   declare interface DropboxTypes$team$MembersSetPermissionsErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersSetPermissionsError =
//     | DropboxTypes$team$UserSelectorError
//     | DropboxTypes$team$MembersSetPermissionsErrorLastAdmin
//     | DropboxTypes$team$MembersSetPermissionsErrorUserNotInTeam
//     | DropboxTypes$team$MembersSetPermissionsErrorCannotSetPermissions
//     | DropboxTypes$team$MembersSetPermissionsErrorTeamLicenseLimit
//     | DropboxTypes$team$MembersSetPermissionsErrorOther;

//   declare interface DropboxTypes$team$MembersSetPermissionsResult {
//     /**
//     * The member ID of the user to which the change was applied.
//     */
//     team_member_id: DropboxTypes$team_common$TeamMemberId;

//     /**
//     * The role after the change.
//     */
//     role: DropboxTypes$team$AdminTier;
//   }

//   /**
//   * Exactly one of team_member_id, email, or external_id must be provided to
//   * identify the user account. At least one of new_email, new_external_id,
//   * new_given_name, and/or new_surname must be provided.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileArg {
//     /**
//     * Identity of user whose profile will be set.
//     */
//     user: DropboxTypes$team$UserSelectorArg;

//     /**
//     * New email for member.
//     */
//     new_email?: DropboxTypes$common$EmailAddress;

//     /**
//     * New external ID for member.
//     */
//     new_external_id?: DropboxTypes$team_common$MemberExternalId;

//     /**
//     * New given name for member.
//     */
//     new_given_name?: DropboxTypes$common$OptionalNamePart;

//     /**
//     * New surname for member.
//     */
//     new_surname?: DropboxTypes$common$OptionalNamePart;

//     /**
//     * New persistent ID. This field only available to teams using persistent
//     * ID SAML configuration.
//     */
//     new_persistent_id?: string;

//     /**
//     * New value for whether the user is a directory restricted user.
//     */
//     new_is_directory_restricted?: boolean;
//   }

//   /**
//   * It is unsafe to use both external_id and new_external_id.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorExternalIdAndNewExternalIdUnsafe {
//     ".tag": "external_id_and_new_external_id_unsafe";
//   }

//   /**
//   * None of new_email, new_given_name, new_surname, or new_external_id are
//   * specified.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorNoNewDataSpecified {
//     ".tag": "no_new_data_specified";
//   }

//   /**
//   * Email is already reserved for another user.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorEmailReservedForOtherUser {
//     ".tag": "email_reserved_for_other_user";
//   }

//   /**
//   * The external ID is already in use by another team member.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorExternalIdUsedByOtherUser {
//     ".tag": "external_id_used_by_other_user";
//   }

//   /**
//   * Modifying deleted users is not allowed.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorSetProfileDisallowed {
//     ".tag": "set_profile_disallowed";
//   }

//   /**
//   * Parameter new_email cannot be empty.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorParamCannotBeEmpty {
//     ".tag": "param_cannot_be_empty";
//   }

//   /**
//   * Persistent ID is only available to teams with persistent ID SAML
//   * configuration. Please contact Dropbox for more information.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorPersistentIdDisabled {
//     ".tag": "persistent_id_disabled";
//   }

//   /**
//   * The persistent ID is already in use by another team member.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorPersistentIdUsedByOtherUser {
//     ".tag": "persistent_id_used_by_other_user";
//   }

//   /**
//   * Directory Restrictions option is not available.
//   */
//   declare interface DropboxTypes$team$MembersSetProfileErrorDirectoryRestrictedOff {
//     ".tag": "directory_restricted_off";
//   }

//   declare interface DropboxTypes$team$MembersSetProfileErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MembersSetProfileError =
//     | DropboxTypes$team$MemberSelectorError
//     | DropboxTypes$team$MembersSetProfileErrorExternalIdAndNewExternalIdUnsafe
//     | DropboxTypes$team$MembersSetProfileErrorNoNewDataSpecified
//     | DropboxTypes$team$MembersSetProfileErrorEmailReservedForOtherUser
//     | DropboxTypes$team$MembersSetProfileErrorExternalIdUsedByOtherUser
//     | DropboxTypes$team$MembersSetProfileErrorSetProfileDisallowed
//     | DropboxTypes$team$MembersSetProfileErrorParamCannotBeEmpty
//     | DropboxTypes$team$MembersSetProfileErrorPersistentIdDisabled
//     | DropboxTypes$team$MembersSetProfileErrorPersistentIdUsedByOtherUser
//     | DropboxTypes$team$MembersSetProfileErrorDirectoryRestrictedOff
//     | DropboxTypes$team$MembersSetProfileErrorOther;

//   /**
//   * The user is not active, so it cannot be suspended.
//   */
//   declare interface DropboxTypes$team$MembersSuspendErrorSuspendInactiveUser {
//     ".tag": "suspend_inactive_user";
//   }

//   /**
//   * The user is the last admin of the team, so it cannot be suspended.
//   */
//   declare interface DropboxTypes$team$MembersSuspendErrorSuspendLastAdmin {
//     ".tag": "suspend_last_admin";
//   }

//   /**
//   * Team is full. The organization has no available licenses.
//   */
//   declare interface DropboxTypes$team$MembersSuspendErrorTeamLicenseLimit {
//     ".tag": "team_license_limit";
//   }

//   declare type DropboxTypes$team$MembersSuspendError =
//     | DropboxTypes$team$MembersDeactivateError
//     | DropboxTypes$team$MembersSuspendErrorSuspendInactiveUser
//     | DropboxTypes$team$MembersSuspendErrorSuspendLastAdmin
//     | DropboxTypes$team$MembersSuspendErrorTeamLicenseLimit;

//   /**
//   * Expected removed user and transfer_dest user to be different.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorRemovedAndTransferDestShouldDiffer {
//     ".tag": "removed_and_transfer_dest_should_differ";
//   }

//   /**
//   * Expected removed user and transfer_admin user to be different.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorRemovedAndTransferAdminShouldDiffer {
//     ".tag": "removed_and_transfer_admin_should_differ";
//   }

//   /**
//   * No matching user found for the argument transfer_dest_id.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorTransferDestUserNotFound {
//     ".tag": "transfer_dest_user_not_found";
//   }

//   /**
//   * The provided transfer_dest_id does not exist on this team.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorTransferDestUserNotInTeam {
//     ".tag": "transfer_dest_user_not_in_team";
//   }

//   /**
//   * The provided transfer_admin_id does not exist on this team.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorTransferAdminUserNotInTeam {
//     ".tag": "transfer_admin_user_not_in_team";
//   }

//   /**
//   * No matching user found for the argument transfer_admin_id.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorTransferAdminUserNotFound {
//     ".tag": "transfer_admin_user_not_found";
//   }

//   /**
//   * The transfer_admin_id argument must be provided when file transfer is
//   * requested.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorUnspecifiedTransferAdminId {
//     ".tag": "unspecified_transfer_admin_id";
//   }

//   /**
//   * Specified transfer_admin user is not a team admin.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorTransferAdminIsNotAdmin {
//     ".tag": "transfer_admin_is_not_admin";
//   }

//   /**
//   * The recipient user's email is not verified.
//   */
//   declare interface DropboxTypes$team$MembersTransferFilesErrorRecipientNotVerified {
//     ".tag": "recipient_not_verified";
//   }

//   declare type DropboxTypes$team$MembersTransferFilesError =
//     | DropboxTypes$team$MembersDeactivateError
//     | DropboxTypes$team$MembersTransferFilesErrorRemovedAndTransferDestShouldDiffer
//     | DropboxTypes$team$MembersTransferFilesErrorRemovedAndTransferAdminShouldDiffer
//     | DropboxTypes$team$MembersTransferFilesErrorTransferDestUserNotFound
//     | DropboxTypes$team$MembersTransferFilesErrorTransferDestUserNotInTeam
//     | DropboxTypes$team$MembersTransferFilesErrorTransferAdminUserNotInTeam
//     | DropboxTypes$team$MembersTransferFilesErrorTransferAdminUserNotFound
//     | DropboxTypes$team$MembersTransferFilesErrorUnspecifiedTransferAdminId
//     | DropboxTypes$team$MembersTransferFilesErrorTransferAdminIsNotAdmin
//     | DropboxTypes$team$MembersTransferFilesErrorRecipientNotVerified;

//   /**
//   * The user's data is being transferred. Please wait some time before
//   * retrying.
//   */
//   declare interface DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserDataIsBeingTransferred {
//     ".tag": "user_data_is_being_transferred";
//   }

//   /**
//   * No matching removed user found for the argument user.
//   */
//   declare interface DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserNotRemoved {
//     ".tag": "user_not_removed";
//   }

//   /**
//   * User files aren't transferable anymore.
//   */
//   declare interface DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserDataCannotBeTransferred {
//     ".tag": "user_data_cannot_be_transferred";
//   }

//   /**
//   * User's data has already been transferred to another user.
//   */
//   declare interface DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserDataAlreadyTransferred {
//     ".tag": "user_data_already_transferred";
//   }

//   declare type DropboxTypes$team$MembersTransferFormerMembersFilesError =
//     | DropboxTypes$team$MembersTransferFilesError
//     | DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserDataIsBeingTransferred
//     | DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserNotRemoved
//     | DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserDataCannotBeTransferred
//     | DropboxTypes$team$MembersTransferFormerMembersFilesErrorUserDataAlreadyTransferred;

//   /**
//   * Exactly one of team_member_id, email, or external_id must be provided to
//   * identify the user account.
//   */
//   declare interface DropboxTypes$team$MembersUnsuspendArg {
//     /**
//     * Identity of user to unsuspend.
//     */
//     user: DropboxTypes$team$UserSelectorArg;
//   }

//   /**
//   * The user is unsuspended, so it cannot be unsuspended again.
//   */
//   declare interface DropboxTypes$team$MembersUnsuspendErrorUnsuspendNonSuspendedMember {
//     ".tag": "unsuspend_non_suspended_member";
//   }

//   /**
//   * Team is full. The organization has no available licenses.
//   */
//   declare interface DropboxTypes$team$MembersUnsuspendErrorTeamLicenseLimit {
//     ".tag": "team_license_limit";
//   }

//   declare type DropboxTypes$team$MembersUnsuspendError =
//     | DropboxTypes$team$MembersDeactivateError
//     | DropboxTypes$team$MembersUnsuspendErrorUnsuspendNonSuspendedMember
//     | DropboxTypes$team$MembersUnsuspendErrorTeamLicenseLimit;

//   /**
//   * Official Dropbox iPhone client.
//   */
//   declare interface DropboxTypes$team$MobileClientPlatformIphone {
//     ".tag": "iphone";
//   }

//   /**
//   * Official Dropbox iPad client.
//   */
//   declare interface DropboxTypes$team$MobileClientPlatformIpad {
//     ".tag": "ipad";
//   }

//   /**
//   * Official Dropbox Android client.
//   */
//   declare interface DropboxTypes$team$MobileClientPlatformAndroid {
//     ".tag": "android";
//   }

//   /**
//   * Official Dropbox Windows phone client.
//   */
//   declare interface DropboxTypes$team$MobileClientPlatformWindowsPhone {
//     ".tag": "windows_phone";
//   }

//   /**
//   * Official Dropbox Blackberry client.
//   */
//   declare interface DropboxTypes$team$MobileClientPlatformBlackberry {
//     ".tag": "blackberry";
//   }

//   declare interface DropboxTypes$team$MobileClientPlatformOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$MobileClientPlatform =
//     | DropboxTypes$team$MobileClientPlatformIphone
//     | DropboxTypes$team$MobileClientPlatformIpad
//     | DropboxTypes$team$MobileClientPlatformAndroid
//     | DropboxTypes$team$MobileClientPlatformWindowsPhone
//     | DropboxTypes$team$MobileClientPlatformBlackberry
//     | DropboxTypes$team$MobileClientPlatformOther;

//   /**
//   * Information about linked Dropbox mobile client sessions.
//   */
//   declare type DropboxTypes$team$MobileClientSession = {
//     /**
//     * The device name.
//     */
//     device_name: string,

//     /**
//     * The mobile application type.
//     */
//     client_type: DropboxTypes$team$MobileClientPlatform,

//     /**
//     * The dropbox client version.
//     */
//     client_version?: string,

//     /**
//     * The hosting OS version.
//     */
//     os_version?: string,

//     /**
//     * last carrier used by the device.
//     */
//     last_carrier?: string,
//     ...
//   } & DropboxTypes$team$DeviceSession;

//   /**
//   * Properties of a namespace.
//   */
//   declare interface DropboxTypes$team$NamespaceMetadata {
//     /**
//     * The name of this namespace.
//     */
//     name: string;

//     /**
//     * The ID of this namespace.
//     */
//     namespace_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * The type of this namespace.
//     */
//     namespace_type: DropboxTypes$team$NamespaceType;

//     /**
//     * If this is a team member or app folder, the ID of the owning team
//     * member. Otherwise, this field is not present.
//     */
//     team_member_id?: DropboxTypes$team_common$TeamMemberId;
//   }

//   /**
//   * App sandbox folder.
//   */
//   declare interface DropboxTypes$team$NamespaceTypeAppFolder {
//     ".tag": "app_folder";
//   }

//   /**
//   * Shared folder.
//   */
//   declare interface DropboxTypes$team$NamespaceTypeSharedFolder {
//     ".tag": "shared_folder";
//   }

//   /**
//   * Top-level team-owned folder.
//   */
//   declare interface DropboxTypes$team$NamespaceTypeTeamFolder {
//     ".tag": "team_folder";
//   }

//   /**
//   * Team member's home folder.
//   */
//   declare interface DropboxTypes$team$NamespaceTypeTeamMemberFolder {
//     ".tag": "team_member_folder";
//   }

//   declare interface DropboxTypes$team$NamespaceTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$NamespaceType =
//     | DropboxTypes$team$NamespaceTypeAppFolder
//     | DropboxTypes$team$NamespaceTypeSharedFolder
//     | DropboxTypes$team$NamespaceTypeTeamFolder
//     | DropboxTypes$team$NamespaceTypeTeamMemberFolder
//     | DropboxTypes$team$NamespaceTypeOther;

//   /**
//   * Successfully removed user.
//   */
//   declare interface DropboxTypes$team$RemoveCustomQuotaResultSuccess {
//     ".tag": "success";
//     success: DropboxTypes$team$UserSelectorArg;
//   }

//   /**
//   * Invalid user (not in team).
//   */
//   declare interface DropboxTypes$team$RemoveCustomQuotaResultInvalidUser {
//     ".tag": "invalid_user";
//     invalid_user: DropboxTypes$team$UserSelectorArg;
//   }

//   declare interface DropboxTypes$team$RemoveCustomQuotaResultOther {
//     ".tag": "other";
//   }

//   /**
//   * User result for setting member custom quota.
//   */
//   declare type DropboxTypes$team$RemoveCustomQuotaResult =
//     | DropboxTypes$team$RemoveCustomQuotaResultSuccess
//     | DropboxTypes$team$RemoveCustomQuotaResultInvalidUser
//     | DropboxTypes$team$RemoveCustomQuotaResultOther;

//   declare interface DropboxTypes$team$RemovedStatus {
//     /**
//     * True if the removed team member is recoverable.
//     */
//     is_recoverable: boolean;

//     /**
//     * True if the team member's account was converted to individual account.
//     */
//     is_disconnected: boolean;
//   }

//   declare type DropboxTypes$team$RevokeDesktopClientArg = {
//     /**
//     * Defaults to False.
//     */
//     delete_on_unlink?: boolean,
//     ...
//   } & DropboxTypes$team$DeviceSessionArg;

//   /**
//   * End an active session.
//   */
//   declare type DropboxTypes$team$RevokeDeviceSessionArgWebSession = {
//     ".tag": "web_session",
//     ...
//   } & DropboxTypes$team$DeviceSessionArg;

//   /**
//   * Unlink a linked desktop device.
//   */
//   declare type DropboxTypes$team$RevokeDeviceSessionArgDesktopClient = {
//     ".tag": "desktop_client",
//     ...
//   } & DropboxTypes$team$RevokeDesktopClientArg;

//   /**
//   * Unlink a linked mobile device.
//   */
//   declare type DropboxTypes$team$RevokeDeviceSessionArgMobileClient = {
//     ".tag": "mobile_client",
//     ...
//   } & DropboxTypes$team$DeviceSessionArg;

//   declare type DropboxTypes$team$RevokeDeviceSessionArg =
//     | DropboxTypes$team$RevokeDeviceSessionArgWebSession
//     | DropboxTypes$team$RevokeDeviceSessionArgDesktopClient
//     | DropboxTypes$team$RevokeDeviceSessionArgMobileClient;

//   declare interface DropboxTypes$team$RevokeDeviceSessionBatchArg {
//     revoke_devices: Array<DropboxTypes$team$RevokeDeviceSessionArg>;
//   }

//   declare interface DropboxTypes$team$RevokeDeviceSessionBatchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$RevokeDeviceSessionBatchError = DropboxTypes$team$RevokeDeviceSessionBatchErrorOther;

//   declare interface DropboxTypes$team$RevokeDeviceSessionBatchResult {
//     revoke_devices_status: Array<DropboxTypes$team$RevokeDeviceSessionStatus>;
//   }

//   /**
//   * Device session not found.
//   */
//   declare interface DropboxTypes$team$RevokeDeviceSessionErrorDeviceSessionNotFound {
//     ".tag": "device_session_not_found";
//   }

//   /**
//   * Member not found.
//   */
//   declare interface DropboxTypes$team$RevokeDeviceSessionErrorMemberNotFound {
//     ".tag": "member_not_found";
//   }

//   declare interface DropboxTypes$team$RevokeDeviceSessionErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$RevokeDeviceSessionError =
//     | DropboxTypes$team$RevokeDeviceSessionErrorDeviceSessionNotFound
//     | DropboxTypes$team$RevokeDeviceSessionErrorMemberNotFound
//     | DropboxTypes$team$RevokeDeviceSessionErrorOther;

//   declare interface DropboxTypes$team$RevokeDeviceSessionStatus {
//     /**
//     * Result of the revoking request.
//     */
//     success: boolean;

//     /**
//     * The error cause in case of a failure.
//     */
//     error_type?: DropboxTypes$team$RevokeDeviceSessionError;
//   }

//   declare interface DropboxTypes$team$RevokeLinkedApiAppArg {
//     /**
//     * The application's unique id.
//     */
//     app_id: string;

//     /**
//     * The unique id of the member owning the device.
//     */
//     team_member_id: string;

//     /**
//     * Defaults to True.
//     */
//     keep_app_folder?: boolean;
//   }

//   declare interface DropboxTypes$team$RevokeLinkedApiAppBatchArg {
//     revoke_linked_app: Array<DropboxTypes$team$RevokeLinkedApiAppArg>;
//   }

//   declare interface DropboxTypes$team$RevokeLinkedAppBatchErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned by linkedAppsRevokeLinkedAppBatch().
//   */
//   declare type DropboxTypes$team$RevokeLinkedAppBatchError = DropboxTypes$team$RevokeLinkedAppBatchErrorOther;

//   declare interface DropboxTypes$team$RevokeLinkedAppBatchResult {
//     revoke_linked_app_status: Array<DropboxTypes$team$RevokeLinkedAppStatus>;
//   }

//   /**
//   * Application not found.
//   */
//   declare interface DropboxTypes$team$RevokeLinkedAppErrorAppNotFound {
//     ".tag": "app_not_found";
//   }

//   /**
//   * Member not found.
//   */
//   declare interface DropboxTypes$team$RevokeLinkedAppErrorMemberNotFound {
//     ".tag": "member_not_found";
//   }

//   declare interface DropboxTypes$team$RevokeLinkedAppErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned by linkedAppsRevokeLinkedApp().
//   */
//   declare type DropboxTypes$team$RevokeLinkedAppError =
//     | DropboxTypes$team$RevokeLinkedAppErrorAppNotFound
//     | DropboxTypes$team$RevokeLinkedAppErrorMemberNotFound
//     | DropboxTypes$team$RevokeLinkedAppErrorOther;

//   declare interface DropboxTypes$team$RevokeLinkedAppStatus {
//     /**
//     * Result of the revoking request.
//     */
//     success: boolean;

//     /**
//     * The error cause in case of a failure.
//     */
//     error_type?: DropboxTypes$team$RevokeLinkedAppError;
//   }

//   declare interface DropboxTypes$team$SetCustomQuotaArg {
//     /**
//     * List of users and their custom quotas.
//     */
//     users_and_quotas: Array<DropboxTypes$team$UserCustomQuotaArg>;
//   }

//   /**
//   * Some of the users are on the excluded users list and can't have custom
//   * quota set.
//   */
//   declare interface DropboxTypes$team$SetCustomQuotaErrorSomeUsersAreExcluded {
//     ".tag": "some_users_are_excluded";
//   }

//   /**
//   * Error returned when setting member custom quota.
//   */
//   declare type DropboxTypes$team$SetCustomQuotaError =
//     | DropboxTypes$team$CustomQuotaError
//     | DropboxTypes$team$SetCustomQuotaErrorSomeUsersAreExcluded;

//   /**
//   * Describes the number of users in a specific storage bucket.
//   */
//   declare interface DropboxTypes$team$StorageBucket {
//     /**
//     * The name of the storage bucket. For example, '1G' is a bucket of users
//     * with storage size up to 1 Giga.
//     */
//     bucket: string;

//     /**
//     * The number of people whose storage is in the range of this storage
//     * bucket.
//     */
//     users: number;
//   }

//   /**
//   * The team folder ID is invalid.
//   */
//   declare interface DropboxTypes$team$TeamFolderAccessErrorInvalidTeamFolderId {
//     ".tag": "invalid_team_folder_id";
//   }

//   /**
//   * The authenticated app does not have permission to manage that team
//   * folder.
//   */
//   declare interface DropboxTypes$team$TeamFolderAccessErrorNoAccess {
//     ".tag": "no_access";
//   }

//   declare interface DropboxTypes$team$TeamFolderAccessErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamFolderAccessError =
//     | DropboxTypes$team$TeamFolderAccessErrorInvalidTeamFolderId
//     | DropboxTypes$team$TeamFolderAccessErrorNoAccess
//     | DropboxTypes$team$TeamFolderAccessErrorOther;

//   declare type DropboxTypes$team$TeamFolderActivateError = DropboxTypes$team$BaseTeamFolderError;

//   declare type DropboxTypes$team$TeamFolderArchiveArg = {
//     /**
//     * Defaults to False.
//     */
//     force_async_off?: boolean,
//     ...
//   } & DropboxTypes$team$TeamFolderIdArg;

//   declare type DropboxTypes$team$TeamFolderArchiveError = DropboxTypes$team$BaseTeamFolderError;

//   /**
//   * The archive job has finished. The value is the metadata for the resulting
//   * team folder.
//   */
//   declare type DropboxTypes$team$TeamFolderArchiveJobStatusComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$team$TeamFolderMetadata;

//   /**
//   * Error occurred while performing an asynchronous job from
//   * teamFolderArchive().
//   */
//   declare interface DropboxTypes$team$TeamFolderArchiveJobStatusFailed {
//     ".tag": "failed";
//     failed: DropboxTypes$team$TeamFolderArchiveError;
//   }

//   declare type DropboxTypes$team$TeamFolderArchiveJobStatus =
//     | DropboxTypes$async$PollResultBase
//     | DropboxTypes$team$TeamFolderArchiveJobStatusComplete
//     | DropboxTypes$team$TeamFolderArchiveJobStatusFailed;

//   declare type DropboxTypes$team$TeamFolderArchiveLaunchComplete = {
//     ".tag": "complete",
//     ...
//   } & DropboxTypes$team$TeamFolderMetadata;

//   declare type DropboxTypes$team$TeamFolderArchiveLaunch =
//     | DropboxTypes$async$LaunchResultBase
//     | DropboxTypes$team$TeamFolderArchiveLaunchComplete;

//   declare interface DropboxTypes$team$TeamFolderCreateArg {
//     /**
//     * Name for the new team folder.
//     */
//     name: string;

//     /**
//     * The sync setting to apply to this team folder. Only permitted if the
//     * team has team selective sync enabled.
//     */
//     sync_setting?: DropboxTypes$files$SyncSettingArg;
//   }

//   /**
//   * The provided name cannot be used.
//   */
//   declare interface DropboxTypes$team$TeamFolderCreateErrorInvalidFolderName {
//     ".tag": "invalid_folder_name";
//   }

//   /**
//   * There is already a team folder with the provided name.
//   */
//   declare interface DropboxTypes$team$TeamFolderCreateErrorFolderNameAlreadyUsed {
//     ".tag": "folder_name_already_used";
//   }

//   /**
//   * The provided name cannot be used because it is reserved.
//   */
//   declare interface DropboxTypes$team$TeamFolderCreateErrorFolderNameReserved {
//     ".tag": "folder_name_reserved";
//   }

//   /**
//   * An error occurred setting the sync settings.
//   */
//   declare interface DropboxTypes$team$TeamFolderCreateErrorSyncSettingsError {
//     ".tag": "sync_settings_error";
//     sync_settings_error: DropboxTypes$files$SyncSettingsError;
//   }

//   declare interface DropboxTypes$team$TeamFolderCreateErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamFolderCreateError =
//     | DropboxTypes$team$TeamFolderCreateErrorInvalidFolderName
//     | DropboxTypes$team$TeamFolderCreateErrorFolderNameAlreadyUsed
//     | DropboxTypes$team$TeamFolderCreateErrorFolderNameReserved
//     | DropboxTypes$team$TeamFolderCreateErrorSyncSettingsError
//     | DropboxTypes$team$TeamFolderCreateErrorOther;

//   /**
//   * An ID that was provided as a parameter to teamFolderGetInfo() did not
//   * match any of the team's team folders.
//   */
//   declare interface DropboxTypes$team$TeamFolderGetInfoItemIdNotFound {
//     ".tag": "id_not_found";
//     id_not_found: string;
//   }

//   /**
//   * Properties of a team folder.
//   */
//   declare type DropboxTypes$team$TeamFolderGetInfoItemTeamFolderMetadata = {
//     ".tag": "team_folder_metadata",
//     ...
//   } & DropboxTypes$team$TeamFolderMetadata;

//   declare type DropboxTypes$team$TeamFolderGetInfoItem =
//     | DropboxTypes$team$TeamFolderGetInfoItemIdNotFound
//     | DropboxTypes$team$TeamFolderGetInfoItemTeamFolderMetadata;

//   declare interface DropboxTypes$team$TeamFolderIdArg {
//     /**
//     * The ID of the team folder.
//     */
//     team_folder_id: DropboxTypes$common$SharedFolderId;
//   }

//   declare interface DropboxTypes$team$TeamFolderIdListArg {
//     /**
//     * The list of team folder IDs.
//     */
//     team_folder_ids: Array<DropboxTypes$common$SharedFolderId>;
//   }

//   /**
//   * The folder is active and the operation did not succeed.
//   */
//   declare interface DropboxTypes$team$TeamFolderInvalidStatusErrorActive {
//     ".tag": "active";
//   }

//   /**
//   * The folder is archived and the operation did not succeed.
//   */
//   declare interface DropboxTypes$team$TeamFolderInvalidStatusErrorArchived {
//     ".tag": "archived";
//   }

//   /**
//   * The folder is being archived and the operation did not succeed.
//   */
//   declare interface DropboxTypes$team$TeamFolderInvalidStatusErrorArchiveInProgress {
//     ".tag": "archive_in_progress";
//   }

//   declare interface DropboxTypes$team$TeamFolderInvalidStatusErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamFolderInvalidStatusError =
//     | DropboxTypes$team$TeamFolderInvalidStatusErrorActive
//     | DropboxTypes$team$TeamFolderInvalidStatusErrorArchived
//     | DropboxTypes$team$TeamFolderInvalidStatusErrorArchiveInProgress
//     | DropboxTypes$team$TeamFolderInvalidStatusErrorOther;

//   declare interface DropboxTypes$team$TeamFolderListArg {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$team$TeamFolderListContinueArg {
//     /**
//     * Indicates from what point to get the next set of team folders.
//     */
//     cursor: string;
//   }

//   /**
//   * The cursor is invalid.
//   */
//   declare interface DropboxTypes$team$TeamFolderListContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare interface DropboxTypes$team$TeamFolderListContinueErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamFolderListContinueError =
//     | DropboxTypes$team$TeamFolderListContinueErrorInvalidCursor
//     | DropboxTypes$team$TeamFolderListContinueErrorOther;

//   declare interface DropboxTypes$team$TeamFolderListError {
//     access_error: DropboxTypes$team$TeamFolderAccessError;
//   }

//   /**
//   * Result for teamFolderList() and teamFolderListContinue().
//   */
//   declare interface DropboxTypes$team$TeamFolderListResult {
//     /**
//     * List of all team folders in the authenticated team.
//     */
//     team_folders: Array<DropboxTypes$team$TeamFolderMetadata>;

//     /**
//     * Pass the cursor into teamFolderListContinue() to obtain additional team
//     * folders.
//     */
//     cursor: string;

//     /**
//     * Is true if there are additional team folders that have not been
//     * returned yet. An additional call to teamFolderListContinue() can
//     * retrieve them.
//     */
//     has_more: boolean;
//   }

//   /**
//   * Properties of a team folder.
//   */
//   declare interface DropboxTypes$team$TeamFolderMetadata {
//     /**
//     * The ID of the team folder.
//     */
//     team_folder_id: DropboxTypes$common$SharedFolderId;

//     /**
//     * The name of the team folder.
//     */
//     name: string;

//     /**
//     * The status of the team folder.
//     */
//     status: DropboxTypes$team$TeamFolderStatus;

//     /**
//     * True if this team folder is a shared team root.
//     */
//     is_team_shared_dropbox: boolean;

//     /**
//     * The sync setting applied to this team folder.
//     */
//     sync_setting: DropboxTypes$files$SyncSetting;

//     /**
//     * Sync settings applied to contents of this team folder.
//     */
//     content_sync_settings: Array<DropboxTypes$files$ContentSyncSetting>;
//   }

//   declare type DropboxTypes$team$TeamFolderPermanentlyDeleteError = DropboxTypes$team$BaseTeamFolderError;

//   declare type DropboxTypes$team$TeamFolderRenameArg = {
//     /**
//     * New team folder name.
//     */
//     name: string,
//     ...
//   } & DropboxTypes$team$TeamFolderIdArg;

//   /**
//   * The provided folder name cannot be used.
//   */
//   declare interface DropboxTypes$team$TeamFolderRenameErrorInvalidFolderName {
//     ".tag": "invalid_folder_name";
//   }

//   /**
//   * There is already a team folder with the same name.
//   */
//   declare interface DropboxTypes$team$TeamFolderRenameErrorFolderNameAlreadyUsed {
//     ".tag": "folder_name_already_used";
//   }

//   /**
//   * The provided name cannot be used because it is reserved.
//   */
//   declare interface DropboxTypes$team$TeamFolderRenameErrorFolderNameReserved {
//     ".tag": "folder_name_reserved";
//   }

//   declare type DropboxTypes$team$TeamFolderRenameError =
//     | DropboxTypes$team$BaseTeamFolderError
//     | DropboxTypes$team$TeamFolderRenameErrorInvalidFolderName
//     | DropboxTypes$team$TeamFolderRenameErrorFolderNameAlreadyUsed
//     | DropboxTypes$team$TeamFolderRenameErrorFolderNameReserved;

//   /**
//   * The team folder and sub-folders are available to all members.
//   */
//   declare interface DropboxTypes$team$TeamFolderStatusActive {
//     ".tag": "active";
//   }

//   /**
//   * The team folder is not accessible outside of the team folder manager.
//   */
//   declare interface DropboxTypes$team$TeamFolderStatusArchived {
//     ".tag": "archived";
//   }

//   /**
//   * The team folder is not accessible outside of the team folder manager.
//   */
//   declare interface DropboxTypes$team$TeamFolderStatusArchiveInProgress {
//     ".tag": "archive_in_progress";
//   }

//   declare interface DropboxTypes$team$TeamFolderStatusOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamFolderStatus =
//     | DropboxTypes$team$TeamFolderStatusActive
//     | DropboxTypes$team$TeamFolderStatusArchived
//     | DropboxTypes$team$TeamFolderStatusArchiveInProgress
//     | DropboxTypes$team$TeamFolderStatusOther;

//   /**
//   * This action is not allowed for a shared team root.
//   */
//   declare interface DropboxTypes$team$TeamFolderTeamSharedDropboxErrorDisallowed {
//     ".tag": "disallowed";
//   }

//   declare interface DropboxTypes$team$TeamFolderTeamSharedDropboxErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamFolderTeamSharedDropboxError =
//     | DropboxTypes$team$TeamFolderTeamSharedDropboxErrorDisallowed
//     | DropboxTypes$team$TeamFolderTeamSharedDropboxErrorOther;

//   declare type DropboxTypes$team$TeamFolderUpdateSyncSettingsArg = {
//     /**
//     * Sync setting to apply to the team folder itself. Only meaningful if the
//     * team folder is not a shared team root.
//     */
//     sync_setting?: DropboxTypes$files$SyncSettingArg,

//     /**
//     * Sync settings to apply to contents of this team folder.
//     */
//     content_sync_settings?: Array<DropboxTypes$files$ContentSyncSettingArg>,
//     ...
//   } & DropboxTypes$team$TeamFolderIdArg;

//   /**
//   * An error occurred setting the sync settings.
//   */
//   declare interface DropboxTypes$team$TeamFolderUpdateSyncSettingsErrorSyncSettingsError {
//     ".tag": "sync_settings_error";
//     sync_settings_error: DropboxTypes$files$SyncSettingsError;
//   }

//   declare type DropboxTypes$team$TeamFolderUpdateSyncSettingsError =
//     | DropboxTypes$team$BaseTeamFolderError
//     | DropboxTypes$team$TeamFolderUpdateSyncSettingsErrorSyncSettingsError;

//   declare interface DropboxTypes$team$TeamGetInfoResult {
//     /**
//     * The name of the team.
//     */
//     name: string;

//     /**
//     * The ID of the team.
//     */
//     team_id: string;

//     /**
//     * The number of licenses available to the team.
//     */
//     num_licensed_users: number;

//     /**
//     * The number of accounts that have been invited or are already active
//     * members of the team.
//     */
//     num_provisioned_users: number;
//     policies: DropboxTypes$team_policies$TeamMemberPolicies;
//   }

//   /**
//   * Information about a team member.
//   */
//   declare interface DropboxTypes$team$TeamMemberInfo {
//     /**
//     * Profile of a user as a member of a team.
//     */
//     profile: DropboxTypes$team$TeamMemberProfile;

//     /**
//     * The user's role in the team.
//     */
//     role: DropboxTypes$team$AdminTier;
//   }

//   /**
//   * Profile of a user as a member of a team.
//   */
//   declare type DropboxTypes$team$TeamMemberProfile = {
//     /**
//     * List of group IDs of groups that the user belongs to.
//     */
//     groups: Array<DropboxTypes$team_common$GroupId>,

//     /**
//     * The namespace id of the user's root folder.
//     */
//     member_folder_id: DropboxTypes$common$NamespaceId,
//     ...
//   } & DropboxTypes$team$MemberProfile;

//   /**
//   * User has successfully joined the team.
//   */
//   declare interface DropboxTypes$team$TeamMemberStatusActive {
//     ".tag": "active";
//   }

//   /**
//   * User has been invited to a team, but has not joined the team yet.
//   */
//   declare interface DropboxTypes$team$TeamMemberStatusInvited {
//     ".tag": "invited";
//   }

//   /**
//   * User is no longer a member of the team, but the account can be
//   * un-suspended, re-establishing the user as a team member.
//   */
//   declare interface DropboxTypes$team$TeamMemberStatusSuspended {
//     ".tag": "suspended";
//   }

//   /**
//   * User is no longer a member of the team. Removed users are only listed
//   * when include_removed is true in members/list.
//   */
//   declare type DropboxTypes$team$TeamMemberStatusRemoved = {
//     ".tag": "removed",
//     ...
//   } & DropboxTypes$team$RemovedStatus;

//   /**
//   * The user's status as a member of a specific team.
//   */
//   declare type DropboxTypes$team$TeamMemberStatus =
//     | DropboxTypes$team$TeamMemberStatusActive
//     | DropboxTypes$team$TeamMemberStatusInvited
//     | DropboxTypes$team$TeamMemberStatusSuspended
//     | DropboxTypes$team$TeamMemberStatusRemoved;

//   /**
//   * User uses a license and has full access to team resources like the shared
//   * quota.
//   */
//   declare interface DropboxTypes$team$TeamMembershipTypeFull {
//     ".tag": "full";
//   }

//   /**
//   * User does not have access to the shared quota and team admins have
//   * restricted administrative control.
//   */
//   declare interface DropboxTypes$team$TeamMembershipTypeLimited {
//     ".tag": "limited";
//   }

//   declare type DropboxTypes$team$TeamMembershipType =
//     | DropboxTypes$team$TeamMembershipTypeFull
//     | DropboxTypes$team$TeamMembershipTypeLimited;

//   declare interface DropboxTypes$team$TeamNamespacesListArg {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;
//   }

//   declare interface DropboxTypes$team$TeamNamespacesListContinueArg {
//     /**
//     * Indicates from what point to get the next set of team-accessible
//     * namespaces.
//     */
//     cursor: string;
//   }

//   /**
//   * The cursor is invalid.
//   */
//   declare interface DropboxTypes$team$TeamNamespacesListContinueErrorInvalidCursor {
//     ".tag": "invalid_cursor";
//   }

//   declare type DropboxTypes$team$TeamNamespacesListContinueError =
//     | DropboxTypes$team$TeamNamespacesListError
//     | DropboxTypes$team$TeamNamespacesListContinueErrorInvalidCursor;

//   /**
//   * Argument passed in is invalid.
//   */
//   declare interface DropboxTypes$team$TeamNamespacesListErrorInvalidArg {
//     ".tag": "invalid_arg";
//   }

//   declare interface DropboxTypes$team$TeamNamespacesListErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamNamespacesListError =
//     | DropboxTypes$team$TeamNamespacesListErrorInvalidArg
//     | DropboxTypes$team$TeamNamespacesListErrorOther;

//   /**
//   * Result for namespacesList().
//   */
//   declare interface DropboxTypes$team$TeamNamespacesListResult {
//     /**
//     * List of all namespaces the team can access.
//     */
//     namespaces: Array<DropboxTypes$team$NamespaceMetadata>;

//     /**
//     * Pass the cursor into namespacesListContinue() to obtain additional
//     * namespaces. Note that duplicate namespaces may be returned.
//     */
//     cursor: string;

//     /**
//     * Is true if there are additional namespaces that have not been returned
//     * yet.
//     */
//     has_more: boolean;
//   }

//   /**
//   * We couldn't create the report, but we think this was a fluke. Everything
//   * should work if you try it again.
//   */
//   declare interface DropboxTypes$team$TeamReportFailureReasonTemporaryError {
//     ".tag": "temporary_error";
//   }

//   /**
//   * Too many other reports are being created right now. Try creating this
//   * report again once the others finish.
//   */
//   declare interface DropboxTypes$team$TeamReportFailureReasonManyReportsAtOnce {
//     ".tag": "many_reports_at_once";
//   }

//   /**
//   * We couldn't create the report. Try creating the report again with less
//   * data.
//   */
//   declare interface DropboxTypes$team$TeamReportFailureReasonTooMuchData {
//     ".tag": "too_much_data";
//   }

//   declare interface DropboxTypes$team$TeamReportFailureReasonOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team$TeamReportFailureReason =
//     | DropboxTypes$team$TeamReportFailureReasonTemporaryError
//     | DropboxTypes$team$TeamReportFailureReasonManyReportsAtOnce
//     | DropboxTypes$team$TeamReportFailureReasonTooMuchData
//     | DropboxTypes$team$TeamReportFailureReasonOther;

//   /**
//   * The current token is not associated with a team admin, because mappings
//   * were not recorded when the token was created. Consider re-authorizing a
//   * new access token to record its authenticating admin.
//   */
//   declare interface DropboxTypes$team$TokenGetAuthenticatedAdminErrorMappingNotFound {
//     ".tag": "mapping_not_found";
//   }

//   /**
//   * Either the team admin that authorized this token is no longer an active
//   * member of the team or no longer a team admin.
//   */
//   declare interface DropboxTypes$team$TokenGetAuthenticatedAdminErrorAdminNotActive {
//     ".tag": "admin_not_active";
//   }

//   declare interface DropboxTypes$team$TokenGetAuthenticatedAdminErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Error returned by tokenGetAuthenticatedAdmin().
//   */
//   declare type DropboxTypes$team$TokenGetAuthenticatedAdminError =
//     | DropboxTypes$team$TokenGetAuthenticatedAdminErrorMappingNotFound
//     | DropboxTypes$team$TokenGetAuthenticatedAdminErrorAdminNotActive
//     | DropboxTypes$team$TokenGetAuthenticatedAdminErrorOther;

//   /**
//   * Results for tokenGetAuthenticatedAdmin().
//   */
//   declare interface DropboxTypes$team$TokenGetAuthenticatedAdminResult {
//     /**
//     * The admin who authorized the token.
//     */
//     admin_profile: DropboxTypes$team$TeamMemberProfile;
//   }

//   /**
//   * This team has unlimited upload API quota. So far both server version
//   * account and legacy  account type have unlimited monthly upload api quota.
//   */
//   declare interface DropboxTypes$team$UploadApiRateLimitValueUnlimited {
//     ".tag": "unlimited";
//   }

//   /**
//   * The number of upload API calls allowed per month.
//   */
//   declare interface DropboxTypes$team$UploadApiRateLimitValueLimit {
//     ".tag": "limit";
//     limit: number;
//   }

//   declare interface DropboxTypes$team$UploadApiRateLimitValueOther {
//     ".tag": "other";
//   }

//   /**
//   * The value for Feature.upload_api_rate_limit.
//   */
//   declare type DropboxTypes$team$UploadApiRateLimitValue =
//     | DropboxTypes$team$UploadApiRateLimitValueUnlimited
//     | DropboxTypes$team$UploadApiRateLimitValueLimit
//     | DropboxTypes$team$UploadApiRateLimitValueOther;

//   /**
//   * User and their required custom quota in GB (1 TB = 1024 GB).
//   */
//   declare interface DropboxTypes$team$UserCustomQuotaArg {
//     user: DropboxTypes$team$UserSelectorArg;
//     quota_gb: DropboxTypes$team$UserQuota;
//   }

//   /**
//   * User and their custom quota in GB (1 TB = 1024 GB).  No quota returns if
//   * the user has no custom quota set.
//   */
//   declare interface DropboxTypes$team$UserCustomQuotaResult {
//     user: DropboxTypes$team$UserSelectorArg;
//     quota_gb?: DropboxTypes$team$UserQuota;
//   }

//   declare interface DropboxTypes$team$UserSelectorArgTeamMemberId {
//     ".tag": "team_member_id";
//     team_member_id: DropboxTypes$team_common$TeamMemberId;
//   }

//   declare interface DropboxTypes$team$UserSelectorArgExternalId {
//     ".tag": "external_id";
//     external_id: DropboxTypes$team_common$MemberExternalId;
//   }

//   declare interface DropboxTypes$team$UserSelectorArgEmail {
//     ".tag": "email";
//     email: DropboxTypes$common$EmailAddress;
//   }

//   /**
//   * Argument for selecting a single user, either by team_member_id,
//   * external_id or email.
//   */
//   declare type DropboxTypes$team$UserSelectorArg =
//     | DropboxTypes$team$UserSelectorArgTeamMemberId
//     | DropboxTypes$team$UserSelectorArgExternalId
//     | DropboxTypes$team$UserSelectorArgEmail;

//   /**
//   * No matching user found. The provided team_member_id, email, or
//   * external_id does not exist on this team.
//   */
//   declare interface DropboxTypes$team$UserSelectorErrorUserNotFound {
//     ".tag": "user_not_found";
//   }

//   /**
//   * Error that can be returned whenever a struct derived from
//   * team.UserSelectorArg is used.
//   */
//   declare type DropboxTypes$team$UserSelectorError = DropboxTypes$team$UserSelectorErrorUserNotFound;

//   /**
//   * List of member IDs.
//   */
//   declare interface DropboxTypes$team$UsersSelectorArgTeamMemberIds {
//     ".tag": "team_member_ids";
//     team_member_ids: Array<DropboxTypes$team_common$TeamMemberId>;
//   }

//   /**
//   * List of external user IDs.
//   */
//   declare interface DropboxTypes$team$UsersSelectorArgExternalIds {
//     ".tag": "external_ids";
//     external_ids: Array<DropboxTypes$team_common$MemberExternalId>;
//   }

//   /**
//   * List of email addresses.
//   */
//   declare interface DropboxTypes$team$UsersSelectorArgEmails {
//     ".tag": "emails";
//     emails: Array<DropboxTypes$common$EmailAddress>;
//   }

//   /**
//   * Argument for selecting a list of users, either by team_member_ids,
//   * external_ids or emails.
//   */
//   declare type DropboxTypes$team$UsersSelectorArg =
//     | DropboxTypes$team$UsersSelectorArgTeamMemberIds
//     | DropboxTypes$team$UsersSelectorArgExternalIds
//     | DropboxTypes$team$UsersSelectorArgEmails;

//   declare type DropboxTypes$team$GroupsGetInfoResult = Array<DropboxTypes$team$GroupsGetInfoItem>;

//   declare type DropboxTypes$team$MembersGetInfoResult = Array<DropboxTypes$team$MembersGetInfoItem>;

//   declare type DropboxTypes$team$NumberPerDay = Array<Object>;

//   declare type DropboxTypes$team$UserQuota = number;

//   /**
//   * A group which is managed by selected users.
//   */
//   declare interface DropboxTypes$team_common$GroupManagementTypeUserManaged {
//     ".tag": "user_managed";
//   }

//   /**
//   * A group which is managed by team admins only.
//   */
//   declare interface DropboxTypes$team_common$GroupManagementTypeCompanyManaged {
//     ".tag": "company_managed";
//   }

//   /**
//   * A group which is managed automatically by Dropbox.
//   */
//   declare interface DropboxTypes$team_common$GroupManagementTypeSystemManaged {
//     ".tag": "system_managed";
//   }

//   declare interface DropboxTypes$team_common$GroupManagementTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * The group type determines how a group is managed.
//   */
//   declare type DropboxTypes$team_common$GroupManagementType =
//     | DropboxTypes$team_common$GroupManagementTypeUserManaged
//     | DropboxTypes$team_common$GroupManagementTypeCompanyManaged
//     | DropboxTypes$team_common$GroupManagementTypeSystemManaged
//     | DropboxTypes$team_common$GroupManagementTypeOther;

//   /**
//   * Information about a group.
//   */
//   declare interface DropboxTypes$team_common$GroupSummary {
//     group_name: string;
//     group_id: DropboxTypes$team_common$GroupId;

//     /**
//     * External ID of group. This is an arbitrary ID that an admin can attach
//     * to a group.
//     */
//     group_external_id?: DropboxTypes$team_common$GroupExternalId;

//     /**
//     * The number of members in the group.
//     */
//     member_count?: number;

//     /**
//     * Who is allowed to manage the group.
//     */
//     group_management_type: DropboxTypes$team_common$GroupManagementType;
//   }

//   /**
//   * A group to which team members are automatically added. Applicable to
//   * [team folders]{@link https://www.dropbox.com/help/986} only.
//   */
//   declare interface DropboxTypes$team_common$GroupTypeTeam {
//     ".tag": "team";
//   }

//   /**
//   * A group is created and managed by a user.
//   */
//   declare interface DropboxTypes$team_common$GroupTypeUserManaged {
//     ".tag": "user_managed";
//   }

//   declare interface DropboxTypes$team_common$GroupTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * The group type determines how a group is created and managed.
//   */
//   declare type DropboxTypes$team_common$GroupType =
//     | DropboxTypes$team_common$GroupTypeTeam
//     | DropboxTypes$team_common$GroupTypeUserManaged
//     | DropboxTypes$team_common$GroupTypeOther;

//   /**
//   * The team member does not have imposed space limit.
//   */
//   declare interface DropboxTypes$team_common$MemberSpaceLimitTypeOff {
//     ".tag": "off";
//   }

//   /**
//   * The team member has soft imposed space limit - the limit is used for
//   * display and for notifications.
//   */
//   declare interface DropboxTypes$team_common$MemberSpaceLimitTypeAlertOnly {
//     ".tag": "alert_only";
//   }

//   /**
//   * The team member has hard imposed space limit - Dropbox file sync will
//   * stop after the limit is reached.
//   */
//   declare interface DropboxTypes$team_common$MemberSpaceLimitTypeStopSync {
//     ".tag": "stop_sync";
//   }

//   declare interface DropboxTypes$team_common$MemberSpaceLimitTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * The type of the space limit imposed on a team member.
//   */
//   declare type DropboxTypes$team_common$MemberSpaceLimitType =
//     | DropboxTypes$team_common$MemberSpaceLimitTypeOff
//     | DropboxTypes$team_common$MemberSpaceLimitTypeAlertOnly
//     | DropboxTypes$team_common$MemberSpaceLimitTypeStopSync
//     | DropboxTypes$team_common$MemberSpaceLimitTypeOther;

//   /**
//   * Time range.
//   */
//   declare interface DropboxTypes$team_common$TimeRange {
//     /**
//     * Optional starting time (inclusive).
//     */
//     start_time?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * Optional ending time (exclusive).
//     */
//     end_time?: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare type DropboxTypes$team_common$GroupExternalId = string;

//   declare type DropboxTypes$team_common$GroupId = string;

//   declare type DropboxTypes$team_common$MemberExternalId = string;

//   declare type DropboxTypes$team_common$ResellerId = string;

//   declare type DropboxTypes$team_common$TeamMemberId = string;

//   /**
//   * End user session details.
//   */
//   declare interface DropboxTypes$team_log$AccessMethodLogInfoEndUser {
//     ".tag": "end_user";
//     end_user:
//       | DropboxTypes$team_log$WebSessionLogInfoReference
//       | DropboxTypes$team_log$DesktopSessionLogInfoReference
//       | DropboxTypes$team_log$MobileSessionLogInfoReference
//       | DropboxTypes$team_log$SessionLogInfoReference;
//   }

//   /**
//   * Sign in as session details.
//   */
//   declare type DropboxTypes$team_log$AccessMethodLogInfoSignInAs = {
//     ".tag": "sign_in_as",
//     ...
//   } & DropboxTypes$team_log$WebSessionLogInfo;

//   /**
//   * Content manager session details.
//   */
//   declare type DropboxTypes$team_log$AccessMethodLogInfoContentManager = {
//     ".tag": "content_manager",
//     ...
//   } & DropboxTypes$team_log$WebSessionLogInfo;

//   /**
//   * Admin console session details.
//   */
//   declare type DropboxTypes$team_log$AccessMethodLogInfoAdminConsole = {
//     ".tag": "admin_console",
//     ...
//   } & DropboxTypes$team_log$WebSessionLogInfo;

//   /**
//   * Api session details.
//   */
//   declare type DropboxTypes$team_log$AccessMethodLogInfoApi = {
//     ".tag": "api",
//     ...
//   } & DropboxTypes$team_log$ApiSessionLogInfo;

//   declare interface DropboxTypes$team_log$AccessMethodLogInfoOther {
//     ".tag": "other";
//   }

//   /**
//   * Indicates the method in which the action was performed.
//   */
//   declare type DropboxTypes$team_log$AccessMethodLogInfo =
//     | DropboxTypes$team_log$AccessMethodLogInfoEndUser
//     | DropboxTypes$team_log$AccessMethodLogInfoSignInAs
//     | DropboxTypes$team_log$AccessMethodLogInfoContentManager
//     | DropboxTypes$team_log$AccessMethodLogInfoAdminConsole
//     | DropboxTypes$team_log$AccessMethodLogInfoApi
//     | DropboxTypes$team_log$AccessMethodLogInfoOther;

//   declare interface DropboxTypes$team_log$AccountCaptureAvailabilityUnavailable {
//     ".tag": "unavailable";
//   }

//   declare interface DropboxTypes$team_log$AccountCaptureAvailabilityAvailable {
//     ".tag": "available";
//   }

//   declare interface DropboxTypes$team_log$AccountCaptureAvailabilityOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$AccountCaptureAvailability =
//     | DropboxTypes$team_log$AccountCaptureAvailabilityUnavailable
//     | DropboxTypes$team_log$AccountCaptureAvailabilityAvailable
//     | DropboxTypes$team_log$AccountCaptureAvailabilityOther;

//   /**
//   * Granted/revoked option to enable account capture on team domains.
//   */
//   declare interface DropboxTypes$team_log$AccountCaptureChangeAvailabilityDetails {
//     /**
//     * New account capture availabilty value.
//     */
//     new_value: DropboxTypes$team_log$AccountCaptureAvailability;

//     /**
//     * Previous account capture availabilty value. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$AccountCaptureAvailability;
//   }

//   declare interface DropboxTypes$team_log$AccountCaptureChangeAvailabilityType {
//     description: string;
//   }

//   /**
//   * Changed account capture setting on team domain.
//   */
//   declare interface DropboxTypes$team_log$AccountCaptureChangePolicyDetails {
//     /**
//     * New account capture policy.
//     */
//     new_value: DropboxTypes$team_log$AccountCapturePolicy;

//     /**
//     * Previous account capture policy. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$team_log$AccountCapturePolicy;
//   }

//   declare interface DropboxTypes$team_log$AccountCaptureChangePolicyType {
//     description: string;
//   }

//   /**
//   * Account-captured user migrated account to team.
//   */
//   declare interface DropboxTypes$team_log$AccountCaptureMigrateAccountDetails {
//     /**
//     * Domain name.
//     */
//     domain_name: string;
//   }

//   declare interface DropboxTypes$team_log$AccountCaptureMigrateAccountType {
//     description: string;
//   }

//   /**
//   * Sent proactive account capture email to all unmanaged members.
//   */
//   declare interface DropboxTypes$team_log$AccountCaptureNotificationEmailsSentDetails {
//     /**
//     * Domain name.
//     */
//     domain_name: string;
//   }

//   declare interface DropboxTypes$team_log$AccountCaptureNotificationEmailsSentType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$AccountCapturePolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$AccountCapturePolicyInvitedUsers {
//     ".tag": "invited_users";
//   }

//   declare interface DropboxTypes$team_log$AccountCapturePolicyAllUsers {
//     ".tag": "all_users";
//   }

//   declare interface DropboxTypes$team_log$AccountCapturePolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$AccountCapturePolicy =
//     | DropboxTypes$team_log$AccountCapturePolicyDisabled
//     | DropboxTypes$team_log$AccountCapturePolicyInvitedUsers
//     | DropboxTypes$team_log$AccountCapturePolicyAllUsers
//     | DropboxTypes$team_log$AccountCapturePolicyOther;

//   /**
//   * Account-captured user changed account email to personal email.
//   */
//   declare interface DropboxTypes$team_log$AccountCaptureRelinquishAccountDetails {
//     /**
//     * Domain name.
//     */
//     domain_name: string;
//   }

//   declare interface DropboxTypes$team_log$AccountCaptureRelinquishAccountType {
//     description: string;
//   }

//   /**
//   * Additional information relevant when a new member joins the team.
//   */
//   declare type DropboxTypes$team_log$ActionDetailsTeamJoinDetails = {
//     ".tag": "team_join_details",
//     ...
//   } & DropboxTypes$team_log$JoinTeamDetails;

//   /**
//   * Define how the user was removed from the team.
//   */
//   declare interface DropboxTypes$team_log$ActionDetailsRemoveAction {
//     ".tag": "remove_action";
//     remove_action: DropboxTypes$team_log$MemberRemoveActionType;
//   }

//   declare interface DropboxTypes$team_log$ActionDetailsOther {
//     ".tag": "other";
//   }

//   /**
//   * Additional information indicating the action taken that caused status
//   * change.
//   */
//   declare type DropboxTypes$team_log$ActionDetails =
//     | DropboxTypes$team_log$ActionDetailsTeamJoinDetails
//     | DropboxTypes$team_log$ActionDetailsRemoveAction
//     | DropboxTypes$team_log$ActionDetailsOther;

//   /**
//   * The user who did the action.
//   */
//   declare interface DropboxTypes$team_log$ActorLogInfoUser {
//     ".tag": "user";
//     user:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;
//   }

//   /**
//   * The admin who did the action.
//   */
//   declare interface DropboxTypes$team_log$ActorLogInfoAdmin {
//     ".tag": "admin";
//     admin:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;
//   }

//   /**
//   * The application who did the action.
//   */
//   declare interface DropboxTypes$team_log$ActorLogInfoApp {
//     ".tag": "app";
//     app:
//       | DropboxTypes$team_log$UserOrTeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$UserLinkedAppLogInfoReference
//       | DropboxTypes$team_log$TeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$AppLogInfoReference;
//   }

//   /**
//   * Action done by reseller.
//   */
//   declare type DropboxTypes$team_log$ActorLogInfoReseller = {
//     ".tag": "reseller",
//     ...
//   } & DropboxTypes$team_log$ResellerLogInfo;

//   /**
//   * Action done by Dropbox.
//   */
//   declare interface DropboxTypes$team_log$ActorLogInfoDropbox {
//     ".tag": "dropbox";
//   }

//   /**
//   * Anonymous actor.
//   */
//   declare interface DropboxTypes$team_log$ActorLogInfoAnonymous {
//     ".tag": "anonymous";
//   }

//   declare interface DropboxTypes$team_log$ActorLogInfoOther {
//     ".tag": "other";
//   }

//   /**
//   * The entity who performed the action.
//   */
//   declare type DropboxTypes$team_log$ActorLogInfo =
//     | DropboxTypes$team_log$ActorLogInfoUser
//     | DropboxTypes$team_log$ActorLogInfoAdmin
//     | DropboxTypes$team_log$ActorLogInfoApp
//     | DropboxTypes$team_log$ActorLogInfoReseller
//     | DropboxTypes$team_log$ActorLogInfoDropbox
//     | DropboxTypes$team_log$ActorLogInfoAnonymous
//     | DropboxTypes$team_log$ActorLogInfoOther;

//   declare interface DropboxTypes$team_log$AdminRoleTeamAdmin {
//     ".tag": "team_admin";
//   }

//   declare interface DropboxTypes$team_log$AdminRoleUserManagementAdmin {
//     ".tag": "user_management_admin";
//   }

//   declare interface DropboxTypes$team_log$AdminRoleSupportAdmin {
//     ".tag": "support_admin";
//   }

//   declare interface DropboxTypes$team_log$AdminRoleLimitedAdmin {
//     ".tag": "limited_admin";
//   }

//   declare interface DropboxTypes$team_log$AdminRoleMemberOnly {
//     ".tag": "member_only";
//   }

//   declare interface DropboxTypes$team_log$AdminRoleOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$AdminRole =
//     | DropboxTypes$team_log$AdminRoleTeamAdmin
//     | DropboxTypes$team_log$AdminRoleUserManagementAdmin
//     | DropboxTypes$team_log$AdminRoleSupportAdmin
//     | DropboxTypes$team_log$AdminRoleLimitedAdmin
//     | DropboxTypes$team_log$AdminRoleMemberOnly
//     | DropboxTypes$team_log$AdminRoleOther;

//   /**
//   * Disabled downloads.
//   */
//   declare interface DropboxTypes$team_log$AllowDownloadDisabledDetails {}

//   declare interface DropboxTypes$team_log$AllowDownloadDisabledType {
//     description: string;
//   }

//   /**
//   * Enabled downloads.
//   */
//   declare interface DropboxTypes$team_log$AllowDownloadEnabledDetails {}

//   declare interface DropboxTypes$team_log$AllowDownloadEnabledType {
//     description: string;
//   }

//   /**
//   * Api session.
//   */
//   declare interface DropboxTypes$team_log$ApiSessionLogInfo {
//     /**
//     * Api request ID.
//     */
//     request_id: DropboxTypes$team_log$RequestId;
//   }

//   /**
//   * Linked app for team.
//   */
//   declare interface DropboxTypes$team_log$AppLinkTeamDetails {
//     /**
//     * Relevant application details.
//     */
//     app_info:
//       | DropboxTypes$team_log$UserOrTeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$UserLinkedAppLogInfoReference
//       | DropboxTypes$team_log$TeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$AppLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$AppLinkTeamType {
//     description: string;
//   }

//   /**
//   * Linked app for member.
//   */
//   declare interface DropboxTypes$team_log$AppLinkUserDetails {
//     /**
//     * Relevant application details.
//     */
//     app_info:
//       | DropboxTypes$team_log$UserOrTeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$UserLinkedAppLogInfoReference
//       | DropboxTypes$team_log$TeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$AppLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$AppLinkUserType {
//     description: string;
//   }

//   /**
//   * App's logged information.
//   */
//   declare interface DropboxTypes$team_log$AppLogInfo {
//     /**
//     * App unique ID. Might be missing due to historical data gap.
//     */
//     app_id?: DropboxTypes$team_log$AppId;

//     /**
//     * App display name. Might be missing due to historical data gap.
//     */
//     display_name?: string;
//   }

//   /**
//   * Reference to the AppLogInfo polymorphic type. Contains a .tag property to
//   * let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$team_log$AppLogInfoReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "user_or_team_linked_app" | "user_linked_app" | "team_linked_app",
//     ...
//   } & DropboxTypes$team_log$AppLogInfo;

//   /**
//   * Unlinked app for team.
//   */
//   declare interface DropboxTypes$team_log$AppUnlinkTeamDetails {
//     /**
//     * Relevant application details.
//     */
//     app_info:
//       | DropboxTypes$team_log$UserOrTeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$UserLinkedAppLogInfoReference
//       | DropboxTypes$team_log$TeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$AppLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$AppUnlinkTeamType {
//     description: string;
//   }

//   /**
//   * Unlinked app for member.
//   */
//   declare interface DropboxTypes$team_log$AppUnlinkUserDetails {
//     /**
//     * Relevant application details.
//     */
//     app_info:
//       | DropboxTypes$team_log$UserOrTeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$UserLinkedAppLogInfoReference
//       | DropboxTypes$team_log$TeamLinkedAppLogInfoReference
//       | DropboxTypes$team_log$AppLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$AppUnlinkUserType {
//     description: string;
//   }

//   /**
//   * File's details.
//   */
//   declare type DropboxTypes$team_log$AssetLogInfoFile = {
//     ".tag": "file",
//     ...
//   } & DropboxTypes$team_log$FileLogInfo;

//   /**
//   * Folder's details.
//   */
//   declare type DropboxTypes$team_log$AssetLogInfoFolder = {
//     ".tag": "folder",
//     ...
//   } & DropboxTypes$team_log$FolderLogInfo;

//   /**
//   * Paper document's details.
//   */
//   declare type DropboxTypes$team_log$AssetLogInfoPaperDocument = {
//     ".tag": "paper_document",
//     ...
//   } & DropboxTypes$team_log$PaperDocumentLogInfo;

//   /**
//   * Paper folder's details.
//   */
//   declare type DropboxTypes$team_log$AssetLogInfoPaperFolder = {
//     ".tag": "paper_folder",
//     ...
//   } & DropboxTypes$team_log$PaperFolderLogInfo;

//   /**
//   * Showcase document's details.
//   */
//   declare type DropboxTypes$team_log$AssetLogInfoShowcaseDocument = {
//     ".tag": "showcase_document",
//     ...
//   } & DropboxTypes$team_log$ShowcaseDocumentLogInfo;

//   declare interface DropboxTypes$team_log$AssetLogInfoOther {
//     ".tag": "other";
//   }

//   /**
//   * Asset details.
//   */
//   declare type DropboxTypes$team_log$AssetLogInfo =
//     | DropboxTypes$team_log$AssetLogInfoFile
//     | DropboxTypes$team_log$AssetLogInfoFolder
//     | DropboxTypes$team_log$AssetLogInfoPaperDocument
//     | DropboxTypes$team_log$AssetLogInfoPaperFolder
//     | DropboxTypes$team_log$AssetLogInfoShowcaseDocument
//     | DropboxTypes$team_log$AssetLogInfoOther;

//   declare interface DropboxTypes$team_log$CameraUploadsPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$CameraUploadsPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$CameraUploadsPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if team members can activate camera uploads
//   */
//   declare type DropboxTypes$team_log$CameraUploadsPolicy =
//     | DropboxTypes$team_log$CameraUploadsPolicyDisabled
//     | DropboxTypes$team_log$CameraUploadsPolicyEnabled
//     | DropboxTypes$team_log$CameraUploadsPolicyOther;

//   /**
//   * Changed camera uploads setting for team.
//   */
//   declare interface DropboxTypes$team_log$CameraUploadsPolicyChangedDetails {
//     /**
//     * New camera uploads setting.
//     */
//     new_value: DropboxTypes$team_log$CameraUploadsPolicy;

//     /**
//     * Previous camera uploads setting.
//     */
//     previous_value: DropboxTypes$team_log$CameraUploadsPolicy;
//   }

//   declare interface DropboxTypes$team_log$CameraUploadsPolicyChangedType {
//     description: string;
//   }

//   /**
//   * Certificate details.
//   */
//   declare interface DropboxTypes$team_log$Certificate {
//     /**
//     * Certificate subject.
//     */
//     subject: string;

//     /**
//     * Certificate issuer.
//     */
//     issuer: string;

//     /**
//     * Certificate issue date.
//     */
//     issue_date: string;

//     /**
//     * Certificate expiration date.
//     */
//     expiration_date: string;

//     /**
//     * Certificate serial number.
//     */
//     serial_number: string;

//     /**
//     * Certificate sha1 fingerprint.
//     */
//     sha1_fingerprint: string;

//     /**
//     * Certificate common name.
//     */
//     common_name?: string;
//   }

//   /**
//   * Shared album.
//   */
//   declare interface DropboxTypes$team_log$CollectionShareDetails {
//     /**
//     * Album name.
//     */
//     album_name: string;
//   }

//   declare interface DropboxTypes$team_log$CollectionShareType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$ContentPermanentDeletePolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$ContentPermanentDeletePolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$ContentPermanentDeletePolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for pemanent content deletion
//   */
//   declare type DropboxTypes$team_log$ContentPermanentDeletePolicy =
//     | DropboxTypes$team_log$ContentPermanentDeletePolicyDisabled
//     | DropboxTypes$team_log$ContentPermanentDeletePolicyEnabled
//     | DropboxTypes$team_log$ContentPermanentDeletePolicyOther;

//   /**
//   * Action was done on behalf of a team member.
//   */
//   declare type DropboxTypes$team_log$ContextLogInfoTeamMember = {
//     ".tag": "team_member",
//     ...
//   } & DropboxTypes$team_log$TeamMemberLogInfo;

//   /**
//   * Action was done on behalf of a non team member.
//   */
//   declare type DropboxTypes$team_log$ContextLogInfoNonTeamMember = {
//     ".tag": "non_team_member",
//     ...
//   } & DropboxTypes$team_log$NonTeamMemberLogInfo;

//   /**
//   * Anonymous context.
//   */
//   declare interface DropboxTypes$team_log$ContextLogInfoAnonymous {
//     ".tag": "anonymous";
//   }

//   /**
//   * Action was done on behalf of the team.
//   */
//   declare interface DropboxTypes$team_log$ContextLogInfoTeam {
//     ".tag": "team";
//   }

//   /**
//   * Action was done on behalf of a trusted non team member.
//   */
//   declare type DropboxTypes$team_log$ContextLogInfoTrustedNonTeamMember = {
//     ".tag": "trusted_non_team_member",
//     ...
//   } & DropboxTypes$team_log$TrustedNonTeamMemberLogInfo;

//   declare interface DropboxTypes$team_log$ContextLogInfoOther {
//     ".tag": "other";
//   }

//   /**
//   * The primary entity on which the action was done.
//   */
//   declare type DropboxTypes$team_log$ContextLogInfo =
//     | DropboxTypes$team_log$ContextLogInfoTeamMember
//     | DropboxTypes$team_log$ContextLogInfoNonTeamMember
//     | DropboxTypes$team_log$ContextLogInfoAnonymous
//     | DropboxTypes$team_log$ContextLogInfoTeam
//     | DropboxTypes$team_log$ContextLogInfoTrustedNonTeamMember
//     | DropboxTypes$team_log$ContextLogInfoOther;

//   /**
//   * Created folders.
//   */
//   declare interface DropboxTypes$team_log$CreateFolderDetails {}

//   declare interface DropboxTypes$team_log$CreateFolderType {
//     description: string;
//   }

//   /**
//   * Set restrictions on data center locations where team data resides.
//   */
//   declare interface DropboxTypes$team_log$DataPlacementRestrictionChangePolicyDetails {
//     /**
//     * Previous placement restriction.
//     */
//     previous_value: DropboxTypes$team_log$PlacementRestriction;

//     /**
//     * New placement restriction.
//     */
//     new_value: DropboxTypes$team_log$PlacementRestriction;
//   }

//   declare interface DropboxTypes$team_log$DataPlacementRestrictionChangePolicyType {
//     description: string;
//   }

//   /**
//   * Completed restrictions on data center locations where team data resides.
//   */
//   declare interface DropboxTypes$team_log$DataPlacementRestrictionSatisfyPolicyDetails {
//     /**
//     * Placement restriction.
//     */
//     placement_restriction: DropboxTypes$team_log$PlacementRestriction;
//   }

//   declare interface DropboxTypes$team_log$DataPlacementRestrictionSatisfyPolicyType {
//     description: string;
//   }

//   /**
//   * Information about linked Dropbox desktop client sessions
//   */
//   declare type DropboxTypes$team_log$DesktopDeviceSessionLogInfo = {
//     /**
//     * Desktop session unique id. Might be missing due to historical data gap.
//     */
//     session_info?: DropboxTypes$team_log$DesktopSessionLogInfo,

//     /**
//     * Name of the hosting desktop.
//     */
//     host_name: string,

//     /**
//     * The Dropbox desktop client type.
//     */
//     client_type: DropboxTypes$team$DesktopPlatform,

//     /**
//     * The Dropbox client version.
//     */
//     client_version?: string,

//     /**
//     * Information on the hosting platform.
//     */
//     platform: string,

//     /**
//     * Whether itu2019s possible to delete all of the account files upon
//     * unlinking.
//     */
//     is_delete_on_unlink_supported: boolean,
//     ...
//   } & DropboxTypes$team_log$DeviceSessionLogInfo;

//   /**
//   * Reference to the DesktopDeviceSessionLogInfo type, identified by the
//   * value of the .tag property.
//   */
//   declare type DropboxTypes$team_log$DesktopDeviceSessionLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "desktop_device_session",
//     ...
//   } & DropboxTypes$team_log$DesktopDeviceSessionLogInfo;

//   /**
//   * Desktop session.
//   */
//   declare type DropboxTypes$team_log$DesktopSessionLogInfo = {
//     ...
//   } & DropboxTypes$team_log$SessionLogInfo;

//   /**
//   * Reference to the DesktopSessionLogInfo type, identified by the value of
//   * the .tag property.
//   */
//   declare type DropboxTypes$team_log$DesktopSessionLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "desktop",
//     ...
//   } & DropboxTypes$team_log$DesktopSessionLogInfo;

//   /**
//   * Set/removed limit on number of computers member can link to team Dropbox
//   * account.
//   */
//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeDesktopPolicyDetails {
//     /**
//     * New desktop device approvals policy. Might be missing due to historical
//     * data gap.
//     */
//     new_value?: DropboxTypes$team_log$DeviceApprovalsPolicy;

//     /**
//     * Previous desktop device approvals policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$DeviceApprovalsPolicy;
//   }

//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeDesktopPolicyType {
//     description: string;
//   }

//   /**
//   * Set/removed limit on number of mobile devices member can link to team
//   * Dropbox account.
//   */
//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeMobilePolicyDetails {
//     /**
//     * New mobile device approvals policy. Might be missing due to historical
//     * data gap.
//     */
//     new_value?: DropboxTypes$team_log$DeviceApprovalsPolicy;

//     /**
//     * Previous mobile device approvals policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$DeviceApprovalsPolicy;
//   }

//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeMobilePolicyType {
//     description: string;
//   }

//   /**
//   * Changed device approvals setting when member is over limit.
//   */
//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeOverageActionDetails {
//     /**
//     * New over the limits policy. Might be missing due to historical data
//     * gap.
//     */
//     new_value?: DropboxTypes$team_policies$RolloutMethod;

//     /**
//     * Previous over the limit policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_policies$RolloutMethod;
//   }

//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeOverageActionType {
//     description: string;
//   }

//   /**
//   * Changed device approvals setting when member unlinks approved device.
//   */
//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeUnlinkActionDetails {
//     /**
//     * New device unlink policy. Might be missing due to historical data gap.
//     */
//     new_value?: DropboxTypes$team_log$DeviceUnlinkPolicy;

//     /**
//     * Previous device unlink policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_log$DeviceUnlinkPolicy;
//   }

//   declare interface DropboxTypes$team_log$DeviceApprovalsChangeUnlinkActionType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$DeviceApprovalsPolicyUnlimited {
//     ".tag": "unlimited";
//   }

//   declare interface DropboxTypes$team_log$DeviceApprovalsPolicyLimited {
//     ".tag": "limited";
//   }

//   declare interface DropboxTypes$team_log$DeviceApprovalsPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$DeviceApprovalsPolicy =
//     | DropboxTypes$team_log$DeviceApprovalsPolicyUnlimited
//     | DropboxTypes$team_log$DeviceApprovalsPolicyLimited
//     | DropboxTypes$team_log$DeviceApprovalsPolicyOther;

//   /**
//   * Changed IP address associated with active desktop session.
//   */
//   declare interface DropboxTypes$team_log$DeviceChangeIpDesktopDetails {
//     /**
//     * Device's session logged information.
//     */
//     device_session_info:
//       | DropboxTypes$team_log$DesktopDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$MobileDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$WebDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$LegacyDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$DeviceSessionLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$DeviceChangeIpDesktopType {
//     description: string;
//   }

//   /**
//   * Changed IP address associated with active mobile session.
//   */
//   declare interface DropboxTypes$team_log$DeviceChangeIpMobileDetails {
//     /**
//     * Device's session logged information.
//     */
//     device_session_info?:
//       | DropboxTypes$team_log$DesktopDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$MobileDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$WebDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$LegacyDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$DeviceSessionLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$DeviceChangeIpMobileType {
//     description: string;
//   }

//   /**
//   * Changed IP address associated with active web session.
//   */
//   declare interface DropboxTypes$team_log$DeviceChangeIpWebDetails {
//     /**
//     * Web browser name.
//     */
//     user_agent: string;
//   }

//   declare interface DropboxTypes$team_log$DeviceChangeIpWebType {
//     description: string;
//   }

//   /**
//   * Failed to delete all files from unlinked device.
//   */
//   declare interface DropboxTypes$team_log$DeviceDeleteOnUnlinkFailDetails {
//     /**
//     * Session unique id. Might be missing due to historical data gap.
//     */
//     session_info?:
//       | DropboxTypes$team_log$WebSessionLogInfoReference
//       | DropboxTypes$team_log$DesktopSessionLogInfoReference
//       | DropboxTypes$team_log$MobileSessionLogInfoReference
//       | DropboxTypes$team_log$SessionLogInfoReference;

//     /**
//     * The device name. Might be missing due to historical data gap.
//     */
//     display_name?: string;

//     /**
//     * The number of times that remote file deletion failed.
//     */
//     num_failures: number;
//   }

//   declare interface DropboxTypes$team_log$DeviceDeleteOnUnlinkFailType {
//     description: string;
//   }

//   /**
//   * Deleted all files from unlinked device.
//   */
//   declare interface DropboxTypes$team_log$DeviceDeleteOnUnlinkSuccessDetails {
//     /**
//     * Session unique id. Might be missing due to historical data gap.
//     */
//     session_info?:
//       | DropboxTypes$team_log$WebSessionLogInfoReference
//       | DropboxTypes$team_log$DesktopSessionLogInfoReference
//       | DropboxTypes$team_log$MobileSessionLogInfoReference
//       | DropboxTypes$team_log$SessionLogInfoReference;

//     /**
//     * The device name. Might be missing due to historical data gap.
//     */
//     display_name?: string;
//   }

//   declare interface DropboxTypes$team_log$DeviceDeleteOnUnlinkSuccessType {
//     description: string;
//   }

//   /**
//   * Failed to link device.
//   */
//   declare interface DropboxTypes$team_log$DeviceLinkFailDetails {
//     /**
//     * IP address. Might be missing due to historical data gap.
//     */
//     ip_address?: DropboxTypes$team_log$IpAddress;

//     /**
//     * A description of the device used while user approval blocked.
//     */
//     device_type: DropboxTypes$team_log$DeviceType;
//   }

//   declare interface DropboxTypes$team_log$DeviceLinkFailType {
//     description: string;
//   }

//   /**
//   * Linked device.
//   */
//   declare interface DropboxTypes$team_log$DeviceLinkSuccessDetails {
//     /**
//     * Device's session logged information.
//     */
//     device_session_info?:
//       | DropboxTypes$team_log$DesktopDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$MobileDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$WebDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$LegacyDeviceSessionLogInfoReference
//       | DropboxTypes$team_log$DeviceSessionLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$DeviceLinkSuccessType {
//     description: string;
//   }

//   /**
//   * Disabled device management.
//   */
//   declare interface DropboxTypes$team_log$DeviceManagementDisabledDetails {}

//   declare interface DropboxTypes$team_log$DeviceManagementDisabledType {
//     description: string;
//   }

//   /**
//   * Enabled device management.
//   */
//   declare interface DropboxTypes$team_log$DeviceManagementEnabledDetails {}

//   declare interface DropboxTypes$team_log$DeviceManagementEnabledType {
//     description: string;
//   }

//   /**
//   * Device's session logged information.
//   */
//   declare interface DropboxTypes$team_log$DeviceSessionLogInfo {
//     /**
//     * The IP address of the last activity from this session. Might be missing
//     * due to historical data gap.
//     */
//     ip_address?: DropboxTypes$team_log$IpAddress;

//     /**
//     * The time this session was created. Might be missing due to historical
//     * data gap.
//     */
//     created?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The time of the last activity from this session. Might be missing due
//     * to historical data gap.
//     */
//     updated?: DropboxTypes$common$DropboxTimestamp;
//   }

//   /**
//   * Reference to the DeviceSessionLogInfo polymorphic type. Contains a .tag
//   * property to let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$team_log$DeviceSessionLogInfoReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag":
//       | "desktop_device_session"
//       | "mobile_device_session"
//       | "web_device_session"
//       | "legacy_device_session",
//     ...
//   } & DropboxTypes$team_log$DeviceSessionLogInfo;

//   declare interface DropboxTypes$team_log$DeviceTypeDesktop {
//     ".tag": "desktop";
//   }

//   declare interface DropboxTypes$team_log$DeviceTypeMobile {
//     ".tag": "mobile";
//   }

//   declare interface DropboxTypes$team_log$DeviceTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$DeviceType =
//     | DropboxTypes$team_log$DeviceTypeDesktop
//     | DropboxTypes$team_log$DeviceTypeMobile
//     | DropboxTypes$team_log$DeviceTypeOther;

//   /**
//   * Disconnected device.
//   */
//   declare interface DropboxTypes$team_log$DeviceUnlinkDetails {
//     /**
//     * Session unique id.
//     */
//     session_info?:
//       | DropboxTypes$team_log$WebSessionLogInfoReference
//       | DropboxTypes$team_log$DesktopSessionLogInfoReference
//       | DropboxTypes$team_log$MobileSessionLogInfoReference
//       | DropboxTypes$team_log$SessionLogInfoReference;

//     /**
//     * The device name. Might be missing due to historical data gap.
//     */
//     display_name?: string;

//     /**
//     * True if the user requested to delete data after device unlink, false
//     * otherwise.
//     */
//     delete_data: boolean;
//   }

//   declare interface DropboxTypes$team_log$DeviceUnlinkPolicyRemove {
//     ".tag": "remove";
//   }

//   declare interface DropboxTypes$team_log$DeviceUnlinkPolicyKeep {
//     ".tag": "keep";
//   }

//   declare interface DropboxTypes$team_log$DeviceUnlinkPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$DeviceUnlinkPolicy =
//     | DropboxTypes$team_log$DeviceUnlinkPolicyRemove
//     | DropboxTypes$team_log$DeviceUnlinkPolicyKeep
//     | DropboxTypes$team_log$DeviceUnlinkPolicyOther;

//   declare interface DropboxTypes$team_log$DeviceUnlinkType {
//     description: string;
//   }

//   /**
//   * Added members to directory restrictions list.
//   */
//   declare interface DropboxTypes$team_log$DirectoryRestrictionsAddMembersDetails {}

//   declare interface DropboxTypes$team_log$DirectoryRestrictionsAddMembersType {
//     description: string;
//   }

//   /**
//   * Removed members from directory restrictions list.
//   */
//   declare interface DropboxTypes$team_log$DirectoryRestrictionsRemoveMembersDetails {}

//   declare interface DropboxTypes$team_log$DirectoryRestrictionsRemoveMembersType {
//     description: string;
//   }

//   /**
//   * Disabled domain invites.
//   */
//   declare interface DropboxTypes$team_log$DisabledDomainInvitesDetails {}

//   declare interface DropboxTypes$team_log$DisabledDomainInvitesType {
//     description: string;
//   }

//   /**
//   * Approved user's request to join team.
//   */
//   declare interface DropboxTypes$team_log$DomainInvitesApproveRequestToJoinTeamDetails {}

//   declare interface DropboxTypes$team_log$DomainInvitesApproveRequestToJoinTeamType {
//     description: string;
//   }

//   /**
//   * Declined user's request to join team.
//   */
//   declare interface DropboxTypes$team_log$DomainInvitesDeclineRequestToJoinTeamDetails {}

//   declare interface DropboxTypes$team_log$DomainInvitesDeclineRequestToJoinTeamType {
//     description: string;
//   }

//   /**
//   * Sent domain invites to existing domain accounts.
//   */
//   declare interface DropboxTypes$team_log$DomainInvitesEmailExistingUsersDetails {
//     /**
//     * Domain names.
//     */
//     domain_name: string;

//     /**
//     * Number of recipients.
//     */
//     num_recipients: number;
//   }

//   declare interface DropboxTypes$team_log$DomainInvitesEmailExistingUsersType {
//     description: string;
//   }

//   /**
//   * Requested to join team.
//   */
//   declare interface DropboxTypes$team_log$DomainInvitesRequestToJoinTeamDetails {}

//   declare interface DropboxTypes$team_log$DomainInvitesRequestToJoinTeamType {
//     description: string;
//   }

//   /**
//   * Disabled "Automatically invite new users".
//   */
//   declare interface DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToNoDetails {}

//   declare interface DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToNoType {
//     description: string;
//   }

//   /**
//   * Enabled "Automatically invite new users".
//   */
//   declare interface DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToYesDetails {}

//   declare interface DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToYesType {
//     description: string;
//   }

//   /**
//   * Failed to verify team domain.
//   */
//   declare interface DropboxTypes$team_log$DomainVerificationAddDomainFailDetails {
//     /**
//     * Domain name.
//     */
//     domain_name: string;

//     /**
//     * Domain name verification method. Might be missing due to historical
//     * data gap.
//     */
//     verification_method?: string;
//   }

//   declare interface DropboxTypes$team_log$DomainVerificationAddDomainFailType {
//     description: string;
//   }

//   /**
//   * Verified team domain.
//   */
//   declare interface DropboxTypes$team_log$DomainVerificationAddDomainSuccessDetails {
//     /**
//     * Domain names.
//     */
//     domain_names: Array<string>;

//     /**
//     * Domain name verification method. Might be missing due to historical
//     * data gap.
//     */
//     verification_method?: string;
//   }

//   declare interface DropboxTypes$team_log$DomainVerificationAddDomainSuccessType {
//     description: string;
//   }

//   /**
//   * Removed domain from list of verified team domains.
//   */
//   declare interface DropboxTypes$team_log$DomainVerificationRemoveDomainDetails {
//     /**
//     * Domain names.
//     */
//     domain_names: Array<string>;
//   }

//   declare interface DropboxTypes$team_log$DomainVerificationRemoveDomainType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$DownloadPolicyTypeAllow {
//     ".tag": "allow";
//   }

//   declare interface DropboxTypes$team_log$DownloadPolicyTypeDisallow {
//     ".tag": "disallow";
//   }

//   declare interface DropboxTypes$team_log$DownloadPolicyTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * Shared content downloads policy
//   */
//   declare type DropboxTypes$team_log$DownloadPolicyType =
//     | DropboxTypes$team_log$DownloadPolicyTypeAllow
//     | DropboxTypes$team_log$DownloadPolicyTypeDisallow
//     | DropboxTypes$team_log$DownloadPolicyTypeOther;

//   /**
//   * Represents a time duration: unit and amount
//   */
//   declare interface DropboxTypes$team_log$DurationLogInfo {
//     /**
//     * Time unit.
//     */
//     unit: DropboxTypes$team_log$TimeUnit;

//     /**
//     * Amount of time.
//     */
//     amount: number;
//   }

//   /**
//   * Added members to EMM exception list.
//   */
//   declare interface DropboxTypes$team_log$EmmAddExceptionDetails {}

//   declare interface DropboxTypes$team_log$EmmAddExceptionType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled enterprise mobility management for members.
//   */
//   declare interface DropboxTypes$team_log$EmmChangePolicyDetails {
//     /**
//     * New enterprise mobility management policy.
//     */
//     new_value: DropboxTypes$team_policies$EmmState;

//     /**
//     * Previous enterprise mobility management policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_policies$EmmState;
//   }

//   declare interface DropboxTypes$team_log$EmmChangePolicyType {
//     description: string;
//   }

//   /**
//   * Created EMM-excluded users report.
//   */
//   declare interface DropboxTypes$team_log$EmmCreateExceptionsReportDetails {}

//   declare interface DropboxTypes$team_log$EmmCreateExceptionsReportType {
//     description: string;
//   }

//   /**
//   * Created EMM mobile app usage report.
//   */
//   declare interface DropboxTypes$team_log$EmmCreateUsageReportDetails {}

//   declare interface DropboxTypes$team_log$EmmCreateUsageReportType {
//     description: string;
//   }

//   /**
//   * Failed to sign in via EMM.
//   */
//   declare interface DropboxTypes$team_log$EmmErrorDetails {
//     /**
//     * Error details.
//     */
//     error_details: DropboxTypes$team_log$FailureDetailsLogInfo;
//   }

//   declare interface DropboxTypes$team_log$EmmErrorType {
//     description: string;
//   }

//   /**
//   * Refreshed auth token used for setting up EMM.
//   */
//   declare interface DropboxTypes$team_log$EmmRefreshAuthTokenDetails {}

//   declare interface DropboxTypes$team_log$EmmRefreshAuthTokenType {
//     description: string;
//   }

//   /**
//   * Removed members from EMM exception list.
//   */
//   declare interface DropboxTypes$team_log$EmmRemoveExceptionDetails {}

//   declare interface DropboxTypes$team_log$EmmRemoveExceptionType {
//     description: string;
//   }

//   /**
//   * Enabled domain invites.
//   */
//   declare interface DropboxTypes$team_log$EnabledDomainInvitesDetails {}

//   declare interface DropboxTypes$team_log$EnabledDomainInvitesType {
//     description: string;
//   }

//   /**
//   * Events that apply to management of linked apps.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryApps {
//     ".tag": "apps";
//   }

//   /**
//   * Events that have to do with comments on files and Paper documents.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryComments {
//     ".tag": "comments";
//   }

//   /**
//   * Events that apply to linked devices on mobile, desktop and Web platforms.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryDevices {
//     ".tag": "devices";
//   }

//   /**
//   * Events that involve domain management feature: domain verification,
//   * invite enforcement and account capture.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryDomains {
//     ".tag": "domains";
//   }

//   /**
//   * Events that have to do with filesystem operations on files and folders:
//   * copy, move, delete, etc.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryFileOperations {
//     ".tag": "file_operations";
//   }

//   /**
//   * Events that apply to the file requests feature.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryFileRequests {
//     ".tag": "file_requests";
//   }

//   /**
//   * Events that involve group management.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryGroups {
//     ".tag": "groups";
//   }

//   /**
//   * Events that involve users signing in to or out of Dropbox.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryLogins {
//     ".tag": "logins";
//   }

//   /**
//   * Events that involve team member management.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryMembers {
//     ".tag": "members";
//   }

//   /**
//   * Events that apply to Dropbox Paper.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryPaper {
//     ".tag": "paper";
//   }

//   /**
//   * Events that involve using, changing or resetting passwords.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryPasswords {
//     ".tag": "passwords";
//   }

//   /**
//   * Events that concern generation of admin reports, including team activity
//   * and device usage.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryReports {
//     ".tag": "reports";
//   }

//   /**
//   * Events that apply to all types of sharing and collaboration.
//   */
//   declare interface DropboxTypes$team_log$EventCategorySharing {
//     ".tag": "sharing";
//   }

//   /**
//   * Events that apply to Dropbox Showcase.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryShowcase {
//     ".tag": "showcase";
//   }

//   /**
//   * Events that involve using or configuring single sign-on as well as
//   * administrative policies concerning single sign-on.
//   */
//   declare interface DropboxTypes$team_log$EventCategorySso {
//     ".tag": "sso";
//   }

//   /**
//   * Events that involve team folder management.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryTeamFolders {
//     ".tag": "team_folders";
//   }

//   /**
//   * Events that involve a change in team-wide policies.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryTeamPolicies {
//     ".tag": "team_policies";
//   }

//   /**
//   * Events that involve a change in the team profile.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryTeamProfile {
//     ".tag": "team_profile";
//   }

//   /**
//   * Events that involve using or configuring two factor authentication as
//   * well as administrative policies concerning two factor authentication.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryTfa {
//     ".tag": "tfa";
//   }

//   /**
//   * Events that apply to cross-team trust establishment.
//   */
//   declare interface DropboxTypes$team_log$EventCategoryTrustedTeams {
//     ".tag": "trusted_teams";
//   }

//   declare interface DropboxTypes$team_log$EventCategoryOther {
//     ".tag": "other";
//   }

//   /**
//   * Category of events in event audit log.
//   */
//   declare type DropboxTypes$team_log$EventCategory =
//     | DropboxTypes$team_log$EventCategoryApps
//     | DropboxTypes$team_log$EventCategoryComments
//     | DropboxTypes$team_log$EventCategoryDevices
//     | DropboxTypes$team_log$EventCategoryDomains
//     | DropboxTypes$team_log$EventCategoryFileOperations
//     | DropboxTypes$team_log$EventCategoryFileRequests
//     | DropboxTypes$team_log$EventCategoryGroups
//     | DropboxTypes$team_log$EventCategoryLogins
//     | DropboxTypes$team_log$EventCategoryMembers
//     | DropboxTypes$team_log$EventCategoryPaper
//     | DropboxTypes$team_log$EventCategoryPasswords
//     | DropboxTypes$team_log$EventCategoryReports
//     | DropboxTypes$team_log$EventCategorySharing
//     | DropboxTypes$team_log$EventCategoryShowcase
//     | DropboxTypes$team_log$EventCategorySso
//     | DropboxTypes$team_log$EventCategoryTeamFolders
//     | DropboxTypes$team_log$EventCategoryTeamPolicies
//     | DropboxTypes$team_log$EventCategoryTeamProfile
//     | DropboxTypes$team_log$EventCategoryTfa
//     | DropboxTypes$team_log$EventCategoryTrustedTeams
//     | DropboxTypes$team_log$EventCategoryOther;

//   declare type DropboxTypes$team_log$EventDetailsAppLinkTeamDetails = {
//     ".tag": "app_link_team_details",
//     ...
//   } & DropboxTypes$team_log$AppLinkTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsAppLinkUserDetails = {
//     ".tag": "app_link_user_details",
//     ...
//   } & DropboxTypes$team_log$AppLinkUserDetails;

//   declare type DropboxTypes$team_log$EventDetailsAppUnlinkTeamDetails = {
//     ".tag": "app_unlink_team_details",
//     ...
//   } & DropboxTypes$team_log$AppUnlinkTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsAppUnlinkUserDetails = {
//     ".tag": "app_unlink_user_details",
//     ...
//   } & DropboxTypes$team_log$AppUnlinkUserDetails;

//   declare type DropboxTypes$team_log$EventDetailsIntegrationConnectedDetails = {
//     ".tag": "integration_connected_details",
//     ...
//   } & DropboxTypes$team_log$IntegrationConnectedDetails;

//   declare type DropboxTypes$team_log$EventDetailsIntegrationDisconnectedDetails = {
//     ".tag": "integration_disconnected_details",
//     ...
//   } & DropboxTypes$team_log$IntegrationDisconnectedDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileAddCommentDetails = {
//     ".tag": "file_add_comment_details",
//     ...
//   } & DropboxTypes$team_log$FileAddCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileChangeCommentSubscriptionDetails = {
//     ".tag": "file_change_comment_subscription_details",
//     ...
//   } & DropboxTypes$team_log$FileChangeCommentSubscriptionDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileDeleteCommentDetails = {
//     ".tag": "file_delete_comment_details",
//     ...
//   } & DropboxTypes$team_log$FileDeleteCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileEditCommentDetails = {
//     ".tag": "file_edit_comment_details",
//     ...
//   } & DropboxTypes$team_log$FileEditCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileLikeCommentDetails = {
//     ".tag": "file_like_comment_details",
//     ...
//   } & DropboxTypes$team_log$FileLikeCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileResolveCommentDetails = {
//     ".tag": "file_resolve_comment_details",
//     ...
//   } & DropboxTypes$team_log$FileResolveCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileUnlikeCommentDetails = {
//     ".tag": "file_unlike_comment_details",
//     ...
//   } & DropboxTypes$team_log$FileUnlikeCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileUnresolveCommentDetails = {
//     ".tag": "file_unresolve_comment_details",
//     ...
//   } & DropboxTypes$team_log$FileUnresolveCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceChangeIpDesktopDetails = {
//     ".tag": "device_change_ip_desktop_details",
//     ...
//   } & DropboxTypes$team_log$DeviceChangeIpDesktopDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceChangeIpMobileDetails = {
//     ".tag": "device_change_ip_mobile_details",
//     ...
//   } & DropboxTypes$team_log$DeviceChangeIpMobileDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceChangeIpWebDetails = {
//     ".tag": "device_change_ip_web_details",
//     ...
//   } & DropboxTypes$team_log$DeviceChangeIpWebDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceDeleteOnUnlinkFailDetails = {
//     ".tag": "device_delete_on_unlink_fail_details",
//     ...
//   } & DropboxTypes$team_log$DeviceDeleteOnUnlinkFailDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceDeleteOnUnlinkSuccessDetails = {
//     ".tag": "device_delete_on_unlink_success_details",
//     ...
//   } & DropboxTypes$team_log$DeviceDeleteOnUnlinkSuccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceLinkFailDetails = {
//     ".tag": "device_link_fail_details",
//     ...
//   } & DropboxTypes$team_log$DeviceLinkFailDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceLinkSuccessDetails = {
//     ".tag": "device_link_success_details",
//     ...
//   } & DropboxTypes$team_log$DeviceLinkSuccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceManagementDisabledDetails = {
//     ".tag": "device_management_disabled_details",
//     ...
//   } & DropboxTypes$team_log$DeviceManagementDisabledDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceManagementEnabledDetails = {
//     ".tag": "device_management_enabled_details",
//     ...
//   } & DropboxTypes$team_log$DeviceManagementEnabledDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceUnlinkDetails = {
//     ".tag": "device_unlink_details",
//     ...
//   } & DropboxTypes$team_log$DeviceUnlinkDetails;

//   declare type DropboxTypes$team_log$EventDetailsEmmRefreshAuthTokenDetails = {
//     ".tag": "emm_refresh_auth_token_details",
//     ...
//   } & DropboxTypes$team_log$EmmRefreshAuthTokenDetails;

//   declare type DropboxTypes$team_log$EventDetailsAccountCaptureChangeAvailabilityDetails = {
//     ".tag": "account_capture_change_availability_details",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureChangeAvailabilityDetails;

//   declare type DropboxTypes$team_log$EventDetailsAccountCaptureMigrateAccountDetails = {
//     ".tag": "account_capture_migrate_account_details",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureMigrateAccountDetails;

//   declare type DropboxTypes$team_log$EventDetailsAccountCaptureNotificationEmailsSentDetails = {
//     ".tag": "account_capture_notification_emails_sent_details",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureNotificationEmailsSentDetails;

//   declare type DropboxTypes$team_log$EventDetailsAccountCaptureRelinquishAccountDetails = {
//     ".tag": "account_capture_relinquish_account_details",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureRelinquishAccountDetails;

//   declare type DropboxTypes$team_log$EventDetailsDisabledDomainInvitesDetails = {
//     ".tag": "disabled_domain_invites_details",
//     ...
//   } & DropboxTypes$team_log$DisabledDomainInvitesDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainInvitesApproveRequestToJoinTeamDetails = {
//     ".tag": "domain_invites_approve_request_to_join_team_details",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesApproveRequestToJoinTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainInvitesDeclineRequestToJoinTeamDetails = {
//     ".tag": "domain_invites_decline_request_to_join_team_details",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesDeclineRequestToJoinTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainInvitesEmailExistingUsersDetails = {
//     ".tag": "domain_invites_email_existing_users_details",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesEmailExistingUsersDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainInvitesRequestToJoinTeamDetails = {
//     ".tag": "domain_invites_request_to_join_team_details",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesRequestToJoinTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainInvitesSetInviteNewUserPrefToNoDetails = {
//     ".tag": "domain_invites_set_invite_new_user_pref_to_no_details",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToNoDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainInvitesSetInviteNewUserPrefToYesDetails = {
//     ".tag": "domain_invites_set_invite_new_user_pref_to_yes_details",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToYesDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainVerificationAddDomainFailDetails = {
//     ".tag": "domain_verification_add_domain_fail_details",
//     ...
//   } & DropboxTypes$team_log$DomainVerificationAddDomainFailDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainVerificationAddDomainSuccessDetails = {
//     ".tag": "domain_verification_add_domain_success_details",
//     ...
//   } & DropboxTypes$team_log$DomainVerificationAddDomainSuccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsDomainVerificationRemoveDomainDetails = {
//     ".tag": "domain_verification_remove_domain_details",
//     ...
//   } & DropboxTypes$team_log$DomainVerificationRemoveDomainDetails;

//   declare type DropboxTypes$team_log$EventDetailsEnabledDomainInvitesDetails = {
//     ".tag": "enabled_domain_invites_details",
//     ...
//   } & DropboxTypes$team_log$EnabledDomainInvitesDetails;

//   declare type DropboxTypes$team_log$EventDetailsCreateFolderDetails = {
//     ".tag": "create_folder_details",
//     ...
//   } & DropboxTypes$team_log$CreateFolderDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileAddDetails = {
//     ".tag": "file_add_details",
//     ...
//   } & DropboxTypes$team_log$FileAddDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileCopyDetails = {
//     ".tag": "file_copy_details",
//     ...
//   } & DropboxTypes$team_log$FileCopyDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileDeleteDetails = {
//     ".tag": "file_delete_details",
//     ...
//   } & DropboxTypes$team_log$FileDeleteDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileDownloadDetails = {
//     ".tag": "file_download_details",
//     ...
//   } & DropboxTypes$team_log$FileDownloadDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileEditDetails = {
//     ".tag": "file_edit_details",
//     ...
//   } & DropboxTypes$team_log$FileEditDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileGetCopyReferenceDetails = {
//     ".tag": "file_get_copy_reference_details",
//     ...
//   } & DropboxTypes$team_log$FileGetCopyReferenceDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileMoveDetails = {
//     ".tag": "file_move_details",
//     ...
//   } & DropboxTypes$team_log$FileMoveDetails;

//   declare type DropboxTypes$team_log$EventDetailsFilePermanentlyDeleteDetails = {
//     ".tag": "file_permanently_delete_details",
//     ...
//   } & DropboxTypes$team_log$FilePermanentlyDeleteDetails;

//   declare type DropboxTypes$team_log$EventDetailsFilePreviewDetails = {
//     ".tag": "file_preview_details",
//     ...
//   } & DropboxTypes$team_log$FilePreviewDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRenameDetails = {
//     ".tag": "file_rename_details",
//     ...
//   } & DropboxTypes$team_log$FileRenameDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRestoreDetails = {
//     ".tag": "file_restore_details",
//     ...
//   } & DropboxTypes$team_log$FileRestoreDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRevertDetails = {
//     ".tag": "file_revert_details",
//     ...
//   } & DropboxTypes$team_log$FileRevertDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRollbackChangesDetails = {
//     ".tag": "file_rollback_changes_details",
//     ...
//   } & DropboxTypes$team_log$FileRollbackChangesDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileSaveCopyReferenceDetails = {
//     ".tag": "file_save_copy_reference_details",
//     ...
//   } & DropboxTypes$team_log$FileSaveCopyReferenceDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestChangeDetails = {
//     ".tag": "file_request_change_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestChangeDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestCloseDetails = {
//     ".tag": "file_request_close_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestCloseDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestCreateDetails = {
//     ".tag": "file_request_create_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestCreateDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestDeleteDetails = {
//     ".tag": "file_request_delete_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestDeleteDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestReceiveFileDetails = {
//     ".tag": "file_request_receive_file_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestReceiveFileDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupAddExternalIdDetails = {
//     ".tag": "group_add_external_id_details",
//     ...
//   } & DropboxTypes$team_log$GroupAddExternalIdDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupAddMemberDetails = {
//     ".tag": "group_add_member_details",
//     ...
//   } & DropboxTypes$team_log$GroupAddMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupChangeExternalIdDetails = {
//     ".tag": "group_change_external_id_details",
//     ...
//   } & DropboxTypes$team_log$GroupChangeExternalIdDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupChangeManagementTypeDetails = {
//     ".tag": "group_change_management_type_details",
//     ...
//   } & DropboxTypes$team_log$GroupChangeManagementTypeDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupChangeMemberRoleDetails = {
//     ".tag": "group_change_member_role_details",
//     ...
//   } & DropboxTypes$team_log$GroupChangeMemberRoleDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupCreateDetails = {
//     ".tag": "group_create_details",
//     ...
//   } & DropboxTypes$team_log$GroupCreateDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupDeleteDetails = {
//     ".tag": "group_delete_details",
//     ...
//   } & DropboxTypes$team_log$GroupDeleteDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupDescriptionUpdatedDetails = {
//     ".tag": "group_description_updated_details",
//     ...
//   } & DropboxTypes$team_log$GroupDescriptionUpdatedDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupJoinPolicyUpdatedDetails = {
//     ".tag": "group_join_policy_updated_details",
//     ...
//   } & DropboxTypes$team_log$GroupJoinPolicyUpdatedDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupMovedDetails = {
//     ".tag": "group_moved_details",
//     ...
//   } & DropboxTypes$team_log$GroupMovedDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupRemoveExternalIdDetails = {
//     ".tag": "group_remove_external_id_details",
//     ...
//   } & DropboxTypes$team_log$GroupRemoveExternalIdDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupRemoveMemberDetails = {
//     ".tag": "group_remove_member_details",
//     ...
//   } & DropboxTypes$team_log$GroupRemoveMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupRenameDetails = {
//     ".tag": "group_rename_details",
//     ...
//   } & DropboxTypes$team_log$GroupRenameDetails;

//   declare type DropboxTypes$team_log$EventDetailsEmmErrorDetails = {
//     ".tag": "emm_error_details",
//     ...
//   } & DropboxTypes$team_log$EmmErrorDetails;

//   declare type DropboxTypes$team_log$EventDetailsGuestAdminSignedInViaTrustedTeamsDetails = {
//     ".tag": "guest_admin_signed_in_via_trusted_teams_details",
//     ...
//   } & DropboxTypes$team_log$GuestAdminSignedInViaTrustedTeamsDetails;

//   declare type DropboxTypes$team_log$EventDetailsGuestAdminSignedOutViaTrustedTeamsDetails = {
//     ".tag": "guest_admin_signed_out_via_trusted_teams_details",
//     ...
//   } & DropboxTypes$team_log$GuestAdminSignedOutViaTrustedTeamsDetails;

//   declare type DropboxTypes$team_log$EventDetailsLoginFailDetails = {
//     ".tag": "login_fail_details",
//     ...
//   } & DropboxTypes$team_log$LoginFailDetails;

//   declare type DropboxTypes$team_log$EventDetailsLoginSuccessDetails = {
//     ".tag": "login_success_details",
//     ...
//   } & DropboxTypes$team_log$LoginSuccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsLogoutDetails = {
//     ".tag": "logout_details",
//     ...
//   } & DropboxTypes$team_log$LogoutDetails;

//   declare type DropboxTypes$team_log$EventDetailsResellerSupportSessionEndDetails = {
//     ".tag": "reseller_support_session_end_details",
//     ...
//   } & DropboxTypes$team_log$ResellerSupportSessionEndDetails;

//   declare type DropboxTypes$team_log$EventDetailsResellerSupportSessionStartDetails = {
//     ".tag": "reseller_support_session_start_details",
//     ...
//   } & DropboxTypes$team_log$ResellerSupportSessionStartDetails;

//   declare type DropboxTypes$team_log$EventDetailsSignInAsSessionEndDetails = {
//     ".tag": "sign_in_as_session_end_details",
//     ...
//   } & DropboxTypes$team_log$SignInAsSessionEndDetails;

//   declare type DropboxTypes$team_log$EventDetailsSignInAsSessionStartDetails = {
//     ".tag": "sign_in_as_session_start_details",
//     ...
//   } & DropboxTypes$team_log$SignInAsSessionStartDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoErrorDetails = {
//     ".tag": "sso_error_details",
//     ...
//   } & DropboxTypes$team_log$SsoErrorDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberAddExternalIdDetails = {
//     ".tag": "member_add_external_id_details",
//     ...
//   } & DropboxTypes$team_log$MemberAddExternalIdDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberAddNameDetails = {
//     ".tag": "member_add_name_details",
//     ...
//   } & DropboxTypes$team_log$MemberAddNameDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberChangeAdminRoleDetails = {
//     ".tag": "member_change_admin_role_details",
//     ...
//   } & DropboxTypes$team_log$MemberChangeAdminRoleDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberChangeEmailDetails = {
//     ".tag": "member_change_email_details",
//     ...
//   } & DropboxTypes$team_log$MemberChangeEmailDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberChangeExternalIdDetails = {
//     ".tag": "member_change_external_id_details",
//     ...
//   } & DropboxTypes$team_log$MemberChangeExternalIdDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberChangeMembershipTypeDetails = {
//     ".tag": "member_change_membership_type_details",
//     ...
//   } & DropboxTypes$team_log$MemberChangeMembershipTypeDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberChangeNameDetails = {
//     ".tag": "member_change_name_details",
//     ...
//   } & DropboxTypes$team_log$MemberChangeNameDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberChangeStatusDetails = {
//     ".tag": "member_change_status_details",
//     ...
//   } & DropboxTypes$team_log$MemberChangeStatusDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberDeleteManualContactsDetails = {
//     ".tag": "member_delete_manual_contacts_details",
//     ...
//   } & DropboxTypes$team_log$MemberDeleteManualContactsDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberPermanentlyDeleteAccountContentsDetails = {
//     ".tag": "member_permanently_delete_account_contents_details",
//     ...
//   } & DropboxTypes$team_log$MemberPermanentlyDeleteAccountContentsDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberRemoveExternalIdDetails = {
//     ".tag": "member_remove_external_id_details",
//     ...
//   } & DropboxTypes$team_log$MemberRemoveExternalIdDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsAddCustomQuotaDetails = {
//     ".tag": "member_space_limits_add_custom_quota_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsAddCustomQuotaDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangeCustomQuotaDetails = {
//     ".tag": "member_space_limits_change_custom_quota_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangeCustomQuotaDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangeStatusDetails = {
//     ".tag": "member_space_limits_change_status_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangeStatusDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsRemoveCustomQuotaDetails = {
//     ".tag": "member_space_limits_remove_custom_quota_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsRemoveCustomQuotaDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSuggestDetails = {
//     ".tag": "member_suggest_details",
//     ...
//   } & DropboxTypes$team_log$MemberSuggestDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberTransferAccountContentsDetails = {
//     ".tag": "member_transfer_account_contents_details",
//     ...
//   } & DropboxTypes$team_log$MemberTransferAccountContentsDetails;

//   declare type DropboxTypes$team_log$EventDetailsSecondaryMailsPolicyChangedDetails = {
//     ".tag": "secondary_mails_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$SecondaryMailsPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentAddMemberDetails = {
//     ".tag": "paper_content_add_member_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentAddMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentAddToFolderDetails = {
//     ".tag": "paper_content_add_to_folder_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentAddToFolderDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentArchiveDetails = {
//     ".tag": "paper_content_archive_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentArchiveDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentCreateDetails = {
//     ".tag": "paper_content_create_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentCreateDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentPermanentlyDeleteDetails = {
//     ".tag": "paper_content_permanently_delete_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentPermanentlyDeleteDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentRemoveFromFolderDetails = {
//     ".tag": "paper_content_remove_from_folder_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentRemoveFromFolderDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentRemoveMemberDetails = {
//     ".tag": "paper_content_remove_member_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentRemoveMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentRenameDetails = {
//     ".tag": "paper_content_rename_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentRenameDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperContentRestoreDetails = {
//     ".tag": "paper_content_restore_details",
//     ...
//   } & DropboxTypes$team_log$PaperContentRestoreDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocAddCommentDetails = {
//     ".tag": "paper_doc_add_comment_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocAddCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocChangeMemberRoleDetails = {
//     ".tag": "paper_doc_change_member_role_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocChangeMemberRoleDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocChangeSharingPolicyDetails = {
//     ".tag": "paper_doc_change_sharing_policy_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocChangeSharingPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocChangeSubscriptionDetails = {
//     ".tag": "paper_doc_change_subscription_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocChangeSubscriptionDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocDeletedDetails = {
//     ".tag": "paper_doc_deleted_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocDeletedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocDeleteCommentDetails = {
//     ".tag": "paper_doc_delete_comment_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocDeleteCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocDownloadDetails = {
//     ".tag": "paper_doc_download_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocDownloadDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocEditDetails = {
//     ".tag": "paper_doc_edit_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocEditDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocEditCommentDetails = {
//     ".tag": "paper_doc_edit_comment_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocEditCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocFollowedDetails = {
//     ".tag": "paper_doc_followed_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocFollowedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocMentionDetails = {
//     ".tag": "paper_doc_mention_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocMentionDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocOwnershipChangedDetails = {
//     ".tag": "paper_doc_ownership_changed_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocOwnershipChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocRequestAccessDetails = {
//     ".tag": "paper_doc_request_access_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocRequestAccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocResolveCommentDetails = {
//     ".tag": "paper_doc_resolve_comment_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocResolveCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocRevertDetails = {
//     ".tag": "paper_doc_revert_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocRevertDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocSlackShareDetails = {
//     ".tag": "paper_doc_slack_share_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocSlackShareDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocTeamInviteDetails = {
//     ".tag": "paper_doc_team_invite_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocTeamInviteDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocTrashedDetails = {
//     ".tag": "paper_doc_trashed_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocTrashedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocUnresolveCommentDetails = {
//     ".tag": "paper_doc_unresolve_comment_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocUnresolveCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocUntrashedDetails = {
//     ".tag": "paper_doc_untrashed_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocUntrashedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDocViewDetails = {
//     ".tag": "paper_doc_view_details",
//     ...
//   } & DropboxTypes$team_log$PaperDocViewDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperExternalViewAllowDetails = {
//     ".tag": "paper_external_view_allow_details",
//     ...
//   } & DropboxTypes$team_log$PaperExternalViewAllowDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperExternalViewDefaultTeamDetails = {
//     ".tag": "paper_external_view_default_team_details",
//     ...
//   } & DropboxTypes$team_log$PaperExternalViewDefaultTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperExternalViewForbidDetails = {
//     ".tag": "paper_external_view_forbid_details",
//     ...
//   } & DropboxTypes$team_log$PaperExternalViewForbidDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperFolderChangeSubscriptionDetails = {
//     ".tag": "paper_folder_change_subscription_details",
//     ...
//   } & DropboxTypes$team_log$PaperFolderChangeSubscriptionDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperFolderDeletedDetails = {
//     ".tag": "paper_folder_deleted_details",
//     ...
//   } & DropboxTypes$team_log$PaperFolderDeletedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperFolderFollowedDetails = {
//     ".tag": "paper_folder_followed_details",
//     ...
//   } & DropboxTypes$team_log$PaperFolderFollowedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperFolderTeamInviteDetails = {
//     ".tag": "paper_folder_team_invite_details",
//     ...
//   } & DropboxTypes$team_log$PaperFolderTeamInviteDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperPublishedLinkCreateDetails = {
//     ".tag": "paper_published_link_create_details",
//     ...
//   } & DropboxTypes$team_log$PaperPublishedLinkCreateDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperPublishedLinkDisabledDetails = {
//     ".tag": "paper_published_link_disabled_details",
//     ...
//   } & DropboxTypes$team_log$PaperPublishedLinkDisabledDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperPublishedLinkViewDetails = {
//     ".tag": "paper_published_link_view_details",
//     ...
//   } & DropboxTypes$team_log$PaperPublishedLinkViewDetails;

//   declare type DropboxTypes$team_log$EventDetailsPasswordChangeDetails = {
//     ".tag": "password_change_details",
//     ...
//   } & DropboxTypes$team_log$PasswordChangeDetails;

//   declare type DropboxTypes$team_log$EventDetailsPasswordResetDetails = {
//     ".tag": "password_reset_details",
//     ...
//   } & DropboxTypes$team_log$PasswordResetDetails;

//   declare type DropboxTypes$team_log$EventDetailsPasswordResetAllDetails = {
//     ".tag": "password_reset_all_details",
//     ...
//   } & DropboxTypes$team_log$PasswordResetAllDetails;

//   declare type DropboxTypes$team_log$EventDetailsEmmCreateExceptionsReportDetails = {
//     ".tag": "emm_create_exceptions_report_details",
//     ...
//   } & DropboxTypes$team_log$EmmCreateExceptionsReportDetails;

//   declare type DropboxTypes$team_log$EventDetailsEmmCreateUsageReportDetails = {
//     ".tag": "emm_create_usage_report_details",
//     ...
//   } & DropboxTypes$team_log$EmmCreateUsageReportDetails;

//   declare type DropboxTypes$team_log$EventDetailsExportMembersReportDetails = {
//     ".tag": "export_members_report_details",
//     ...
//   } & DropboxTypes$team_log$ExportMembersReportDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperAdminExportStartDetails = {
//     ".tag": "paper_admin_export_start_details",
//     ...
//   } & DropboxTypes$team_log$PaperAdminExportStartDetails;

//   declare type DropboxTypes$team_log$EventDetailsSmartSyncCreateAdminPrivilegeReportDetails = {
//     ".tag": "smart_sync_create_admin_privilege_report_details",
//     ...
//   } & DropboxTypes$team_log$SmartSyncCreateAdminPrivilegeReportDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamActivityCreateReportDetails = {
//     ".tag": "team_activity_create_report_details",
//     ...
//   } & DropboxTypes$team_log$TeamActivityCreateReportDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamActivityCreateReportFailDetails = {
//     ".tag": "team_activity_create_report_fail_details",
//     ...
//   } & DropboxTypes$team_log$TeamActivityCreateReportFailDetails;

//   declare type DropboxTypes$team_log$EventDetailsCollectionShareDetails = {
//     ".tag": "collection_share_details",
//     ...
//   } & DropboxTypes$team_log$CollectionShareDetails;

//   declare type DropboxTypes$team_log$EventDetailsNoteAclInviteOnlyDetails = {
//     ".tag": "note_acl_invite_only_details",
//     ...
//   } & DropboxTypes$team_log$NoteAclInviteOnlyDetails;

//   declare type DropboxTypes$team_log$EventDetailsNoteAclLinkDetails = {
//     ".tag": "note_acl_link_details",
//     ...
//   } & DropboxTypes$team_log$NoteAclLinkDetails;

//   declare type DropboxTypes$team_log$EventDetailsNoteAclTeamLinkDetails = {
//     ".tag": "note_acl_team_link_details",
//     ...
//   } & DropboxTypes$team_log$NoteAclTeamLinkDetails;

//   declare type DropboxTypes$team_log$EventDetailsNoteSharedDetails = {
//     ".tag": "note_shared_details",
//     ...
//   } & DropboxTypes$team_log$NoteSharedDetails;

//   declare type DropboxTypes$team_log$EventDetailsNoteShareReceiveDetails = {
//     ".tag": "note_share_receive_details",
//     ...
//   } & DropboxTypes$team_log$NoteShareReceiveDetails;

//   declare type DropboxTypes$team_log$EventDetailsOpenNoteSharedDetails = {
//     ".tag": "open_note_shared_details",
//     ...
//   } & DropboxTypes$team_log$OpenNoteSharedDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfAddGroupDetails = {
//     ".tag": "sf_add_group_details",
//     ...
//   } & DropboxTypes$team_log$SfAddGroupDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfAllowNonMembersToViewSharedLinksDetails = {
//     ".tag": "sf_allow_non_members_to_view_shared_links_details",
//     ...
//   } & DropboxTypes$team_log$SfAllowNonMembersToViewSharedLinksDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfExternalInviteWarnDetails = {
//     ".tag": "sf_external_invite_warn_details",
//     ...
//   } & DropboxTypes$team_log$SfExternalInviteWarnDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfFbInviteDetails = {
//     ".tag": "sf_fb_invite_details",
//     ...
//   } & DropboxTypes$team_log$SfFbInviteDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfFbInviteChangeRoleDetails = {
//     ".tag": "sf_fb_invite_change_role_details",
//     ...
//   } & DropboxTypes$team_log$SfFbInviteChangeRoleDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfFbUninviteDetails = {
//     ".tag": "sf_fb_uninvite_details",
//     ...
//   } & DropboxTypes$team_log$SfFbUninviteDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfInviteGroupDetails = {
//     ".tag": "sf_invite_group_details",
//     ...
//   } & DropboxTypes$team_log$SfInviteGroupDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfTeamGrantAccessDetails = {
//     ".tag": "sf_team_grant_access_details",
//     ...
//   } & DropboxTypes$team_log$SfTeamGrantAccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfTeamInviteDetails = {
//     ".tag": "sf_team_invite_details",
//     ...
//   } & DropboxTypes$team_log$SfTeamInviteDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfTeamInviteChangeRoleDetails = {
//     ".tag": "sf_team_invite_change_role_details",
//     ...
//   } & DropboxTypes$team_log$SfTeamInviteChangeRoleDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfTeamJoinDetails = {
//     ".tag": "sf_team_join_details",
//     ...
//   } & DropboxTypes$team_log$SfTeamJoinDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfTeamJoinFromOobLinkDetails = {
//     ".tag": "sf_team_join_from_oob_link_details",
//     ...
//   } & DropboxTypes$team_log$SfTeamJoinFromOobLinkDetails;

//   declare type DropboxTypes$team_log$EventDetailsSfTeamUninviteDetails = {
//     ".tag": "sf_team_uninvite_details",
//     ...
//   } & DropboxTypes$team_log$SfTeamUninviteDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentAddInviteesDetails = {
//     ".tag": "shared_content_add_invitees_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddInviteesDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentAddLinkExpiryDetails = {
//     ".tag": "shared_content_add_link_expiry_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddLinkExpiryDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentAddLinkPasswordDetails = {
//     ".tag": "shared_content_add_link_password_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddLinkPasswordDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentAddMemberDetails = {
//     ".tag": "shared_content_add_member_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentChangeDownloadsPolicyDetails = {
//     ".tag": "shared_content_change_downloads_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeDownloadsPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentChangeInviteeRoleDetails = {
//     ".tag": "shared_content_change_invitee_role_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeInviteeRoleDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentChangeLinkAudienceDetails = {
//     ".tag": "shared_content_change_link_audience_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeLinkAudienceDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentChangeLinkExpiryDetails = {
//     ".tag": "shared_content_change_link_expiry_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeLinkExpiryDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentChangeLinkPasswordDetails = {
//     ".tag": "shared_content_change_link_password_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeLinkPasswordDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentChangeMemberRoleDetails = {
//     ".tag": "shared_content_change_member_role_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeMemberRoleDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentChangeViewerInfoPolicyDetails = {
//     ".tag": "shared_content_change_viewer_info_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeViewerInfoPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentClaimInvitationDetails = {
//     ".tag": "shared_content_claim_invitation_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentClaimInvitationDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentCopyDetails = {
//     ".tag": "shared_content_copy_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentCopyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentDownloadDetails = {
//     ".tag": "shared_content_download_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentDownloadDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentRelinquishMembershipDetails = {
//     ".tag": "shared_content_relinquish_membership_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentRelinquishMembershipDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentRemoveInviteesDetails = {
//     ".tag": "shared_content_remove_invitees_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveInviteesDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentRemoveLinkExpiryDetails = {
//     ".tag": "shared_content_remove_link_expiry_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveLinkExpiryDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentRemoveLinkPasswordDetails = {
//     ".tag": "shared_content_remove_link_password_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveLinkPasswordDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentRemoveMemberDetails = {
//     ".tag": "shared_content_remove_member_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentRequestAccessDetails = {
//     ".tag": "shared_content_request_access_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentRequestAccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentUnshareDetails = {
//     ".tag": "shared_content_unshare_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentUnshareDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedContentViewDetails = {
//     ".tag": "shared_content_view_details",
//     ...
//   } & DropboxTypes$team_log$SharedContentViewDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderChangeLinkPolicyDetails = {
//     ".tag": "shared_folder_change_link_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeLinkPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderChangeMembersInheritancePolicyDetails = {
//     ".tag": "shared_folder_change_members_inheritance_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeMembersInheritancePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderChangeMembersManagementPolicyDetails = {
//     ".tag": "shared_folder_change_members_management_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeMembersManagementPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderChangeMembersPolicyDetails = {
//     ".tag": "shared_folder_change_members_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeMembersPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderCreateDetails = {
//     ".tag": "shared_folder_create_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderCreateDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderDeclineInvitationDetails = {
//     ".tag": "shared_folder_decline_invitation_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderDeclineInvitationDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderMountDetails = {
//     ".tag": "shared_folder_mount_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderMountDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderNestDetails = {
//     ".tag": "shared_folder_nest_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderNestDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderTransferOwnershipDetails = {
//     ".tag": "shared_folder_transfer_ownership_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderTransferOwnershipDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedFolderUnmountDetails = {
//     ".tag": "shared_folder_unmount_details",
//     ...
//   } & DropboxTypes$team_log$SharedFolderUnmountDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkAddExpiryDetails = {
//     ".tag": "shared_link_add_expiry_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkAddExpiryDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkChangeExpiryDetails = {
//     ".tag": "shared_link_change_expiry_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkChangeExpiryDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkChangeVisibilityDetails = {
//     ".tag": "shared_link_change_visibility_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkChangeVisibilityDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkCopyDetails = {
//     ".tag": "shared_link_copy_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkCopyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkCreateDetails = {
//     ".tag": "shared_link_create_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkCreateDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkDisableDetails = {
//     ".tag": "shared_link_disable_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkDisableDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkDownloadDetails = {
//     ".tag": "shared_link_download_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkDownloadDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkRemoveExpiryDetails = {
//     ".tag": "shared_link_remove_expiry_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkRemoveExpiryDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkShareDetails = {
//     ".tag": "shared_link_share_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkShareDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedLinkViewDetails = {
//     ".tag": "shared_link_view_details",
//     ...
//   } & DropboxTypes$team_log$SharedLinkViewDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharedNoteOpenedDetails = {
//     ".tag": "shared_note_opened_details",
//     ...
//   } & DropboxTypes$team_log$SharedNoteOpenedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShmodelGroupShareDetails = {
//     ".tag": "shmodel_group_share_details",
//     ...
//   } & DropboxTypes$team_log$ShmodelGroupShareDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseAccessGrantedDetails = {
//     ".tag": "showcase_access_granted_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseAccessGrantedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseAddMemberDetails = {
//     ".tag": "showcase_add_member_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseAddMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseArchivedDetails = {
//     ".tag": "showcase_archived_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseArchivedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseCreatedDetails = {
//     ".tag": "showcase_created_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseCreatedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseDeleteCommentDetails = {
//     ".tag": "showcase_delete_comment_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseDeleteCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseEditedDetails = {
//     ".tag": "showcase_edited_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseEditedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseEditCommentDetails = {
//     ".tag": "showcase_edit_comment_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseEditCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseFileAddedDetails = {
//     ".tag": "showcase_file_added_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileAddedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseFileDownloadDetails = {
//     ".tag": "showcase_file_download_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileDownloadDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseFileRemovedDetails = {
//     ".tag": "showcase_file_removed_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileRemovedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseFileViewDetails = {
//     ".tag": "showcase_file_view_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileViewDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcasePermanentlyDeletedDetails = {
//     ".tag": "showcase_permanently_deleted_details",
//     ...
//   } & DropboxTypes$team_log$ShowcasePermanentlyDeletedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcasePostCommentDetails = {
//     ".tag": "showcase_post_comment_details",
//     ...
//   } & DropboxTypes$team_log$ShowcasePostCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseRemoveMemberDetails = {
//     ".tag": "showcase_remove_member_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRemoveMemberDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseRenamedDetails = {
//     ".tag": "showcase_renamed_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRenamedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseRequestAccessDetails = {
//     ".tag": "showcase_request_access_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRequestAccessDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseResolveCommentDetails = {
//     ".tag": "showcase_resolve_comment_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseResolveCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseRestoredDetails = {
//     ".tag": "showcase_restored_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRestoredDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseTrashedDetails = {
//     ".tag": "showcase_trashed_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseTrashedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseTrashedDeprecatedDetails = {
//     ".tag": "showcase_trashed_deprecated_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseTrashedDeprecatedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseUnresolveCommentDetails = {
//     ".tag": "showcase_unresolve_comment_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseUnresolveCommentDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseUntrashedDetails = {
//     ".tag": "showcase_untrashed_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseUntrashedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseUntrashedDeprecatedDetails = {
//     ".tag": "showcase_untrashed_deprecated_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseUntrashedDeprecatedDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseViewDetails = {
//     ".tag": "showcase_view_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseViewDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoAddCertDetails = {
//     ".tag": "sso_add_cert_details",
//     ...
//   } & DropboxTypes$team_log$SsoAddCertDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoAddLoginUrlDetails = {
//     ".tag": "sso_add_login_url_details",
//     ...
//   } & DropboxTypes$team_log$SsoAddLoginUrlDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoAddLogoutUrlDetails = {
//     ".tag": "sso_add_logout_url_details",
//     ...
//   } & DropboxTypes$team_log$SsoAddLogoutUrlDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoChangeCertDetails = {
//     ".tag": "sso_change_cert_details",
//     ...
//   } & DropboxTypes$team_log$SsoChangeCertDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoChangeLoginUrlDetails = {
//     ".tag": "sso_change_login_url_details",
//     ...
//   } & DropboxTypes$team_log$SsoChangeLoginUrlDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoChangeLogoutUrlDetails = {
//     ".tag": "sso_change_logout_url_details",
//     ...
//   } & DropboxTypes$team_log$SsoChangeLogoutUrlDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoChangeSamlIdentityModeDetails = {
//     ".tag": "sso_change_saml_identity_mode_details",
//     ...
//   } & DropboxTypes$team_log$SsoChangeSamlIdentityModeDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoRemoveCertDetails = {
//     ".tag": "sso_remove_cert_details",
//     ...
//   } & DropboxTypes$team_log$SsoRemoveCertDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoRemoveLoginUrlDetails = {
//     ".tag": "sso_remove_login_url_details",
//     ...
//   } & DropboxTypes$team_log$SsoRemoveLoginUrlDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoRemoveLogoutUrlDetails = {
//     ".tag": "sso_remove_logout_url_details",
//     ...
//   } & DropboxTypes$team_log$SsoRemoveLogoutUrlDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamFolderChangeStatusDetails = {
//     ".tag": "team_folder_change_status_details",
//     ...
//   } & DropboxTypes$team_log$TeamFolderChangeStatusDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamFolderCreateDetails = {
//     ".tag": "team_folder_create_details",
//     ...
//   } & DropboxTypes$team_log$TeamFolderCreateDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamFolderDowngradeDetails = {
//     ".tag": "team_folder_downgrade_details",
//     ...
//   } & DropboxTypes$team_log$TeamFolderDowngradeDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamFolderPermanentlyDeleteDetails = {
//     ".tag": "team_folder_permanently_delete_details",
//     ...
//   } & DropboxTypes$team_log$TeamFolderPermanentlyDeleteDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamFolderRenameDetails = {
//     ".tag": "team_folder_rename_details",
//     ...
//   } & DropboxTypes$team_log$TeamFolderRenameDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamSelectiveSyncSettingsChangedDetails = {
//     ".tag": "team_selective_sync_settings_changed_details",
//     ...
//   } & DropboxTypes$team_log$TeamSelectiveSyncSettingsChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsAccountCaptureChangePolicyDetails = {
//     ".tag": "account_capture_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsAllowDownloadDisabledDetails = {
//     ".tag": "allow_download_disabled_details",
//     ...
//   } & DropboxTypes$team_log$AllowDownloadDisabledDetails;

//   declare type DropboxTypes$team_log$EventDetailsAllowDownloadEnabledDetails = {
//     ".tag": "allow_download_enabled_details",
//     ...
//   } & DropboxTypes$team_log$AllowDownloadEnabledDetails;

//   declare type DropboxTypes$team_log$EventDetailsCameraUploadsPolicyChangedDetails = {
//     ".tag": "camera_uploads_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$CameraUploadsPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsDataPlacementRestrictionChangePolicyDetails = {
//     ".tag": "data_placement_restriction_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$DataPlacementRestrictionChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsDataPlacementRestrictionSatisfyPolicyDetails = {
//     ".tag": "data_placement_restriction_satisfy_policy_details",
//     ...
//   } & DropboxTypes$team_log$DataPlacementRestrictionSatisfyPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeDesktopPolicyDetails = {
//     ".tag": "device_approvals_change_desktop_policy_details",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeDesktopPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeMobilePolicyDetails = {
//     ".tag": "device_approvals_change_mobile_policy_details",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeMobilePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeOverageActionDetails = {
//     ".tag": "device_approvals_change_overage_action_details",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeOverageActionDetails;

//   declare type DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeUnlinkActionDetails = {
//     ".tag": "device_approvals_change_unlink_action_details",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeUnlinkActionDetails;

//   declare type DropboxTypes$team_log$EventDetailsDirectoryRestrictionsAddMembersDetails = {
//     ".tag": "directory_restrictions_add_members_details",
//     ...
//   } & DropboxTypes$team_log$DirectoryRestrictionsAddMembersDetails;

//   declare type DropboxTypes$team_log$EventDetailsDirectoryRestrictionsRemoveMembersDetails = {
//     ".tag": "directory_restrictions_remove_members_details",
//     ...
//   } & DropboxTypes$team_log$DirectoryRestrictionsRemoveMembersDetails;

//   declare type DropboxTypes$team_log$EventDetailsEmmAddExceptionDetails = {
//     ".tag": "emm_add_exception_details",
//     ...
//   } & DropboxTypes$team_log$EmmAddExceptionDetails;

//   declare type DropboxTypes$team_log$EventDetailsEmmChangePolicyDetails = {
//     ".tag": "emm_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$EmmChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsEmmRemoveExceptionDetails = {
//     ".tag": "emm_remove_exception_details",
//     ...
//   } & DropboxTypes$team_log$EmmRemoveExceptionDetails;

//   declare type DropboxTypes$team_log$EventDetailsExtendedVersionHistoryChangePolicyDetails = {
//     ".tag": "extended_version_history_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$ExtendedVersionHistoryChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileCommentsChangePolicyDetails = {
//     ".tag": "file_comments_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$FileCommentsChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestsChangePolicyDetails = {
//     ".tag": "file_requests_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestsChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestsEmailsEnabledDetails = {
//     ".tag": "file_requests_emails_enabled_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestsEmailsEnabledDetails;

//   declare type DropboxTypes$team_log$EventDetailsFileRequestsEmailsRestrictedToTeamOnlyDetails = {
//     ".tag": "file_requests_emails_restricted_to_team_only_details",
//     ...
//   } & DropboxTypes$team_log$FileRequestsEmailsRestrictedToTeamOnlyDetails;

//   declare type DropboxTypes$team_log$EventDetailsGoogleSsoChangePolicyDetails = {
//     ".tag": "google_sso_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$GoogleSsoChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsGroupUserManagementChangePolicyDetails = {
//     ".tag": "group_user_management_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$GroupUserManagementChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsIntegrationPolicyChangedDetails = {
//     ".tag": "integration_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$IntegrationPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberRequestsChangePolicyDetails = {
//     ".tag": "member_requests_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$MemberRequestsChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsAddExceptionDetails = {
//     ".tag": "member_space_limits_add_exception_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsAddExceptionDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangeCapsTypePolicyDetails = {
//     ".tag": "member_space_limits_change_caps_type_policy_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangeCapsTypePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangePolicyDetails = {
//     ".tag": "member_space_limits_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSpaceLimitsRemoveExceptionDetails = {
//     ".tag": "member_space_limits_remove_exception_details",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsRemoveExceptionDetails;

//   declare type DropboxTypes$team_log$EventDetailsMemberSuggestionsChangePolicyDetails = {
//     ".tag": "member_suggestions_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$MemberSuggestionsChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsMicrosoftOfficeAddinChangePolicyDetails = {
//     ".tag": "microsoft_office_addin_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$MicrosoftOfficeAddinChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsNetworkControlChangePolicyDetails = {
//     ".tag": "network_control_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$NetworkControlChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperChangeDeploymentPolicyDetails = {
//     ".tag": "paper_change_deployment_policy_details",
//     ...
//   } & DropboxTypes$team_log$PaperChangeDeploymentPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperChangeMemberLinkPolicyDetails = {
//     ".tag": "paper_change_member_link_policy_details",
//     ...
//   } & DropboxTypes$team_log$PaperChangeMemberLinkPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperChangeMemberPolicyDetails = {
//     ".tag": "paper_change_member_policy_details",
//     ...
//   } & DropboxTypes$team_log$PaperChangeMemberPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperChangePolicyDetails = {
//     ".tag": "paper_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$PaperChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDefaultFolderPolicyChangedDetails = {
//     ".tag": "paper_default_folder_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$PaperDefaultFolderPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperDesktopPolicyChangedDetails = {
//     ".tag": "paper_desktop_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$PaperDesktopPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperEnabledUsersGroupAdditionDetails = {
//     ".tag": "paper_enabled_users_group_addition_details",
//     ...
//   } & DropboxTypes$team_log$PaperEnabledUsersGroupAdditionDetails;

//   declare type DropboxTypes$team_log$EventDetailsPaperEnabledUsersGroupRemovalDetails = {
//     ".tag": "paper_enabled_users_group_removal_details",
//     ...
//   } & DropboxTypes$team_log$PaperEnabledUsersGroupRemovalDetails;

//   declare type DropboxTypes$team_log$EventDetailsPermanentDeleteChangePolicyDetails = {
//     ".tag": "permanent_delete_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$PermanentDeleteChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsResellerSupportChangePolicyDetails = {
//     ".tag": "reseller_support_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$ResellerSupportChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharingChangeFolderJoinPolicyDetails = {
//     ".tag": "sharing_change_folder_join_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharingChangeFolderJoinPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharingChangeLinkPolicyDetails = {
//     ".tag": "sharing_change_link_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharingChangeLinkPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSharingChangeMemberPolicyDetails = {
//     ".tag": "sharing_change_member_policy_details",
//     ...
//   } & DropboxTypes$team_log$SharingChangeMemberPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseChangeDownloadPolicyDetails = {
//     ".tag": "showcase_change_download_policy_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseChangeDownloadPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseChangeEnabledPolicyDetails = {
//     ".tag": "showcase_change_enabled_policy_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseChangeEnabledPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsShowcaseChangeExternalSharingPolicyDetails = {
//     ".tag": "showcase_change_external_sharing_policy_details",
//     ...
//   } & DropboxTypes$team_log$ShowcaseChangeExternalSharingPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSmartSyncChangePolicyDetails = {
//     ".tag": "smart_sync_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$SmartSyncChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsSmartSyncNotOptOutDetails = {
//     ".tag": "smart_sync_not_opt_out_details",
//     ...
//   } & DropboxTypes$team_log$SmartSyncNotOptOutDetails;

//   declare type DropboxTypes$team_log$EventDetailsSmartSyncOptOutDetails = {
//     ".tag": "smart_sync_opt_out_details",
//     ...
//   } & DropboxTypes$team_log$SmartSyncOptOutDetails;

//   declare type DropboxTypes$team_log$EventDetailsSsoChangePolicyDetails = {
//     ".tag": "sso_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$SsoChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamExtensionsPolicyChangedDetails = {
//     ".tag": "team_extensions_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$TeamExtensionsPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamSelectiveSyncPolicyChangedDetails = {
//     ".tag": "team_selective_sync_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$TeamSelectiveSyncPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaChangePolicyDetails = {
//     ".tag": "tfa_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$TfaChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsTwoAccountChangePolicyDetails = {
//     ".tag": "two_account_change_policy_details",
//     ...
//   } & DropboxTypes$team_log$TwoAccountChangePolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsViewerInfoPolicyChangedDetails = {
//     ".tag": "viewer_info_policy_changed_details",
//     ...
//   } & DropboxTypes$team_log$ViewerInfoPolicyChangedDetails;

//   declare type DropboxTypes$team_log$EventDetailsWebSessionsChangeFixedLengthPolicyDetails = {
//     ".tag": "web_sessions_change_fixed_length_policy_details",
//     ...
//   } & DropboxTypes$team_log$WebSessionsChangeFixedLengthPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsWebSessionsChangeIdleLengthPolicyDetails = {
//     ".tag": "web_sessions_change_idle_length_policy_details",
//     ...
//   } & DropboxTypes$team_log$WebSessionsChangeIdleLengthPolicyDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeFromDetails = {
//     ".tag": "team_merge_from_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeFromDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeToDetails = {
//     ".tag": "team_merge_to_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeToDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamProfileAddLogoDetails = {
//     ".tag": "team_profile_add_logo_details",
//     ...
//   } & DropboxTypes$team_log$TeamProfileAddLogoDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamProfileChangeDefaultLanguageDetails = {
//     ".tag": "team_profile_change_default_language_details",
//     ...
//   } & DropboxTypes$team_log$TeamProfileChangeDefaultLanguageDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamProfileChangeLogoDetails = {
//     ".tag": "team_profile_change_logo_details",
//     ...
//   } & DropboxTypes$team_log$TeamProfileChangeLogoDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamProfileChangeNameDetails = {
//     ".tag": "team_profile_change_name_details",
//     ...
//   } & DropboxTypes$team_log$TeamProfileChangeNameDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamProfileRemoveLogoDetails = {
//     ".tag": "team_profile_remove_logo_details",
//     ...
//   } & DropboxTypes$team_log$TeamProfileRemoveLogoDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaAddBackupPhoneDetails = {
//     ".tag": "tfa_add_backup_phone_details",
//     ...
//   } & DropboxTypes$team_log$TfaAddBackupPhoneDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaAddSecurityKeyDetails = {
//     ".tag": "tfa_add_security_key_details",
//     ...
//   } & DropboxTypes$team_log$TfaAddSecurityKeyDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaChangeBackupPhoneDetails = {
//     ".tag": "tfa_change_backup_phone_details",
//     ...
//   } & DropboxTypes$team_log$TfaChangeBackupPhoneDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaChangeStatusDetails = {
//     ".tag": "tfa_change_status_details",
//     ...
//   } & DropboxTypes$team_log$TfaChangeStatusDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaRemoveBackupPhoneDetails = {
//     ".tag": "tfa_remove_backup_phone_details",
//     ...
//   } & DropboxTypes$team_log$TfaRemoveBackupPhoneDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaRemoveSecurityKeyDetails = {
//     ".tag": "tfa_remove_security_key_details",
//     ...
//   } & DropboxTypes$team_log$TfaRemoveSecurityKeyDetails;

//   declare type DropboxTypes$team_log$EventDetailsTfaResetDetails = {
//     ".tag": "tfa_reset_details",
//     ...
//   } & DropboxTypes$team_log$TfaResetDetails;

//   declare type DropboxTypes$team_log$EventDetailsGuestAdminChangeStatusDetails = {
//     ".tag": "guest_admin_change_status_details",
//     ...
//   } & DropboxTypes$team_log$GuestAdminChangeStatusDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestAcceptedDetails = {
//     ".tag": "team_merge_request_accepted_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAcceptedDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestAcceptedShownToPrimaryTeamDetails = {
//     ".tag": "team_merge_request_accepted_shown_to_primary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAcceptedShownToPrimaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestAcceptedShownToSecondaryTeamDetails = {
//     ".tag": "team_merge_request_accepted_shown_to_secondary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAcceptedShownToSecondaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestAutoCanceledDetails = {
//     ".tag": "team_merge_request_auto_canceled_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAutoCanceledDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestCanceledDetails = {
//     ".tag": "team_merge_request_canceled_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestCanceledDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestCanceledShownToPrimaryTeamDetails = {
//     ".tag": "team_merge_request_canceled_shown_to_primary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestCanceledShownToPrimaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestCanceledShownToSecondaryTeamDetails = {
//     ".tag": "team_merge_request_canceled_shown_to_secondary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestCanceledShownToSecondaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestExpiredDetails = {
//     ".tag": "team_merge_request_expired_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestExpiredDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestExpiredShownToPrimaryTeamDetails = {
//     ".tag": "team_merge_request_expired_shown_to_primary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestExpiredShownToPrimaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestExpiredShownToSecondaryTeamDetails = {
//     ".tag": "team_merge_request_expired_shown_to_secondary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestExpiredShownToSecondaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestRejectedShownToPrimaryTeamDetails = {
//     ".tag": "team_merge_request_rejected_shown_to_primary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestRejectedShownToPrimaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestRejectedShownToSecondaryTeamDetails = {
//     ".tag": "team_merge_request_rejected_shown_to_secondary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestRejectedShownToSecondaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestReminderDetails = {
//     ".tag": "team_merge_request_reminder_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestReminderDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestReminderShownToPrimaryTeamDetails = {
//     ".tag": "team_merge_request_reminder_shown_to_primary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestReminderShownToPrimaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestReminderShownToSecondaryTeamDetails = {
//     ".tag": "team_merge_request_reminder_shown_to_secondary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestReminderShownToSecondaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestRevokedDetails = {
//     ".tag": "team_merge_request_revoked_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestRevokedDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestSentShownToPrimaryTeamDetails = {
//     ".tag": "team_merge_request_sent_shown_to_primary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestSentShownToPrimaryTeamDetails;

//   declare type DropboxTypes$team_log$EventDetailsTeamMergeRequestSentShownToSecondaryTeamDetails = {
//     ".tag": "team_merge_request_sent_shown_to_secondary_team_details",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestSentShownToSecondaryTeamDetails;

//   /**
//   * Hints that this event was returned with missing details due to an
//   * internal error.
//   */
//   declare type DropboxTypes$team_log$EventDetailsMissingDetails = {
//     ".tag": "missing_details",
//     ...
//   } & DropboxTypes$team_log$MissingDetails;

//   declare interface DropboxTypes$team_log$EventDetailsOther {
//     ".tag": "other";
//   }

//   /**
//   * Additional fields depending on the event type.
//   */
//   declare type DropboxTypes$team_log$EventDetails =
//     | DropboxTypes$team_log$EventDetailsAppLinkTeamDetails
//     | DropboxTypes$team_log$EventDetailsAppLinkUserDetails
//     | DropboxTypes$team_log$EventDetailsAppUnlinkTeamDetails
//     | DropboxTypes$team_log$EventDetailsAppUnlinkUserDetails
//     | DropboxTypes$team_log$EventDetailsIntegrationConnectedDetails
//     | DropboxTypes$team_log$EventDetailsIntegrationDisconnectedDetails
//     | DropboxTypes$team_log$EventDetailsFileAddCommentDetails
//     | DropboxTypes$team_log$EventDetailsFileChangeCommentSubscriptionDetails
//     | DropboxTypes$team_log$EventDetailsFileDeleteCommentDetails
//     | DropboxTypes$team_log$EventDetailsFileEditCommentDetails
//     | DropboxTypes$team_log$EventDetailsFileLikeCommentDetails
//     | DropboxTypes$team_log$EventDetailsFileResolveCommentDetails
//     | DropboxTypes$team_log$EventDetailsFileUnlikeCommentDetails
//     | DropboxTypes$team_log$EventDetailsFileUnresolveCommentDetails
//     | DropboxTypes$team_log$EventDetailsDeviceChangeIpDesktopDetails
//     | DropboxTypes$team_log$EventDetailsDeviceChangeIpMobileDetails
//     | DropboxTypes$team_log$EventDetailsDeviceChangeIpWebDetails
//     | DropboxTypes$team_log$EventDetailsDeviceDeleteOnUnlinkFailDetails
//     | DropboxTypes$team_log$EventDetailsDeviceDeleteOnUnlinkSuccessDetails
//     | DropboxTypes$team_log$EventDetailsDeviceLinkFailDetails
//     | DropboxTypes$team_log$EventDetailsDeviceLinkSuccessDetails
//     | DropboxTypes$team_log$EventDetailsDeviceManagementDisabledDetails
//     | DropboxTypes$team_log$EventDetailsDeviceManagementEnabledDetails
//     | DropboxTypes$team_log$EventDetailsDeviceUnlinkDetails
//     | DropboxTypes$team_log$EventDetailsEmmRefreshAuthTokenDetails
//     | DropboxTypes$team_log$EventDetailsAccountCaptureChangeAvailabilityDetails
//     | DropboxTypes$team_log$EventDetailsAccountCaptureMigrateAccountDetails
//     | DropboxTypes$team_log$EventDetailsAccountCaptureNotificationEmailsSentDetails
//     | DropboxTypes$team_log$EventDetailsAccountCaptureRelinquishAccountDetails
//     | DropboxTypes$team_log$EventDetailsDisabledDomainInvitesDetails
//     | DropboxTypes$team_log$EventDetailsDomainInvitesApproveRequestToJoinTeamDetails
//     | DropboxTypes$team_log$EventDetailsDomainInvitesDeclineRequestToJoinTeamDetails
//     | DropboxTypes$team_log$EventDetailsDomainInvitesEmailExistingUsersDetails
//     | DropboxTypes$team_log$EventDetailsDomainInvitesRequestToJoinTeamDetails
//     | DropboxTypes$team_log$EventDetailsDomainInvitesSetInviteNewUserPrefToNoDetails
//     | DropboxTypes$team_log$EventDetailsDomainInvitesSetInviteNewUserPrefToYesDetails
//     | DropboxTypes$team_log$EventDetailsDomainVerificationAddDomainFailDetails
//     | DropboxTypes$team_log$EventDetailsDomainVerificationAddDomainSuccessDetails
//     | DropboxTypes$team_log$EventDetailsDomainVerificationRemoveDomainDetails
//     | DropboxTypes$team_log$EventDetailsEnabledDomainInvitesDetails
//     | DropboxTypes$team_log$EventDetailsCreateFolderDetails
//     | DropboxTypes$team_log$EventDetailsFileAddDetails
//     | DropboxTypes$team_log$EventDetailsFileCopyDetails
//     | DropboxTypes$team_log$EventDetailsFileDeleteDetails
//     | DropboxTypes$team_log$EventDetailsFileDownloadDetails
//     | DropboxTypes$team_log$EventDetailsFileEditDetails
//     | DropboxTypes$team_log$EventDetailsFileGetCopyReferenceDetails
//     | DropboxTypes$team_log$EventDetailsFileMoveDetails
//     | DropboxTypes$team_log$EventDetailsFilePermanentlyDeleteDetails
//     | DropboxTypes$team_log$EventDetailsFilePreviewDetails
//     | DropboxTypes$team_log$EventDetailsFileRenameDetails
//     | DropboxTypes$team_log$EventDetailsFileRestoreDetails
//     | DropboxTypes$team_log$EventDetailsFileRevertDetails
//     | DropboxTypes$team_log$EventDetailsFileRollbackChangesDetails
//     | DropboxTypes$team_log$EventDetailsFileSaveCopyReferenceDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestChangeDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestCloseDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestCreateDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestDeleteDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestReceiveFileDetails
//     | DropboxTypes$team_log$EventDetailsGroupAddExternalIdDetails
//     | DropboxTypes$team_log$EventDetailsGroupAddMemberDetails
//     | DropboxTypes$team_log$EventDetailsGroupChangeExternalIdDetails
//     | DropboxTypes$team_log$EventDetailsGroupChangeManagementTypeDetails
//     | DropboxTypes$team_log$EventDetailsGroupChangeMemberRoleDetails
//     | DropboxTypes$team_log$EventDetailsGroupCreateDetails
//     | DropboxTypes$team_log$EventDetailsGroupDeleteDetails
//     | DropboxTypes$team_log$EventDetailsGroupDescriptionUpdatedDetails
//     | DropboxTypes$team_log$EventDetailsGroupJoinPolicyUpdatedDetails
//     | DropboxTypes$team_log$EventDetailsGroupMovedDetails
//     | DropboxTypes$team_log$EventDetailsGroupRemoveExternalIdDetails
//     | DropboxTypes$team_log$EventDetailsGroupRemoveMemberDetails
//     | DropboxTypes$team_log$EventDetailsGroupRenameDetails
//     | DropboxTypes$team_log$EventDetailsEmmErrorDetails
//     | DropboxTypes$team_log$EventDetailsGuestAdminSignedInViaTrustedTeamsDetails
//     | DropboxTypes$team_log$EventDetailsGuestAdminSignedOutViaTrustedTeamsDetails
//     | DropboxTypes$team_log$EventDetailsLoginFailDetails
//     | DropboxTypes$team_log$EventDetailsLoginSuccessDetails
//     | DropboxTypes$team_log$EventDetailsLogoutDetails
//     | DropboxTypes$team_log$EventDetailsResellerSupportSessionEndDetails
//     | DropboxTypes$team_log$EventDetailsResellerSupportSessionStartDetails
//     | DropboxTypes$team_log$EventDetailsSignInAsSessionEndDetails
//     | DropboxTypes$team_log$EventDetailsSignInAsSessionStartDetails
//     | DropboxTypes$team_log$EventDetailsSsoErrorDetails
//     | DropboxTypes$team_log$EventDetailsMemberAddExternalIdDetails
//     | DropboxTypes$team_log$EventDetailsMemberAddNameDetails
//     | DropboxTypes$team_log$EventDetailsMemberChangeAdminRoleDetails
//     | DropboxTypes$team_log$EventDetailsMemberChangeEmailDetails
//     | DropboxTypes$team_log$EventDetailsMemberChangeExternalIdDetails
//     | DropboxTypes$team_log$EventDetailsMemberChangeMembershipTypeDetails
//     | DropboxTypes$team_log$EventDetailsMemberChangeNameDetails
//     | DropboxTypes$team_log$EventDetailsMemberChangeStatusDetails
//     | DropboxTypes$team_log$EventDetailsMemberDeleteManualContactsDetails
//     | DropboxTypes$team_log$EventDetailsMemberPermanentlyDeleteAccountContentsDetails
//     | DropboxTypes$team_log$EventDetailsMemberRemoveExternalIdDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsAddCustomQuotaDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangeCustomQuotaDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangeStatusDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsRemoveCustomQuotaDetails
//     | DropboxTypes$team_log$EventDetailsMemberSuggestDetails
//     | DropboxTypes$team_log$EventDetailsMemberTransferAccountContentsDetails
//     | DropboxTypes$team_log$EventDetailsSecondaryMailsPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentAddMemberDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentAddToFolderDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentArchiveDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentCreateDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentPermanentlyDeleteDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentRemoveFromFolderDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentRemoveMemberDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentRenameDetails
//     | DropboxTypes$team_log$EventDetailsPaperContentRestoreDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocAddCommentDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocChangeMemberRoleDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocChangeSharingPolicyDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocChangeSubscriptionDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocDeletedDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocDeleteCommentDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocDownloadDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocEditDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocEditCommentDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocFollowedDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocMentionDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocOwnershipChangedDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocRequestAccessDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocResolveCommentDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocRevertDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocSlackShareDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocTeamInviteDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocTrashedDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocUnresolveCommentDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocUntrashedDetails
//     | DropboxTypes$team_log$EventDetailsPaperDocViewDetails
//     | DropboxTypes$team_log$EventDetailsPaperExternalViewAllowDetails
//     | DropboxTypes$team_log$EventDetailsPaperExternalViewDefaultTeamDetails
//     | DropboxTypes$team_log$EventDetailsPaperExternalViewForbidDetails
//     | DropboxTypes$team_log$EventDetailsPaperFolderChangeSubscriptionDetails
//     | DropboxTypes$team_log$EventDetailsPaperFolderDeletedDetails
//     | DropboxTypes$team_log$EventDetailsPaperFolderFollowedDetails
//     | DropboxTypes$team_log$EventDetailsPaperFolderTeamInviteDetails
//     | DropboxTypes$team_log$EventDetailsPaperPublishedLinkCreateDetails
//     | DropboxTypes$team_log$EventDetailsPaperPublishedLinkDisabledDetails
//     | DropboxTypes$team_log$EventDetailsPaperPublishedLinkViewDetails
//     | DropboxTypes$team_log$EventDetailsPasswordChangeDetails
//     | DropboxTypes$team_log$EventDetailsPasswordResetDetails
//     | DropboxTypes$team_log$EventDetailsPasswordResetAllDetails
//     | DropboxTypes$team_log$EventDetailsEmmCreateExceptionsReportDetails
//     | DropboxTypes$team_log$EventDetailsEmmCreateUsageReportDetails
//     | DropboxTypes$team_log$EventDetailsExportMembersReportDetails
//     | DropboxTypes$team_log$EventDetailsPaperAdminExportStartDetails
//     | DropboxTypes$team_log$EventDetailsSmartSyncCreateAdminPrivilegeReportDetails
//     | DropboxTypes$team_log$EventDetailsTeamActivityCreateReportDetails
//     | DropboxTypes$team_log$EventDetailsTeamActivityCreateReportFailDetails
//     | DropboxTypes$team_log$EventDetailsCollectionShareDetails
//     | DropboxTypes$team_log$EventDetailsNoteAclInviteOnlyDetails
//     | DropboxTypes$team_log$EventDetailsNoteAclLinkDetails
//     | DropboxTypes$team_log$EventDetailsNoteAclTeamLinkDetails
//     | DropboxTypes$team_log$EventDetailsNoteSharedDetails
//     | DropboxTypes$team_log$EventDetailsNoteShareReceiveDetails
//     | DropboxTypes$team_log$EventDetailsOpenNoteSharedDetails
//     | DropboxTypes$team_log$EventDetailsSfAddGroupDetails
//     | DropboxTypes$team_log$EventDetailsSfAllowNonMembersToViewSharedLinksDetails
//     | DropboxTypes$team_log$EventDetailsSfExternalInviteWarnDetails
//     | DropboxTypes$team_log$EventDetailsSfFbInviteDetails
//     | DropboxTypes$team_log$EventDetailsSfFbInviteChangeRoleDetails
//     | DropboxTypes$team_log$EventDetailsSfFbUninviteDetails
//     | DropboxTypes$team_log$EventDetailsSfInviteGroupDetails
//     | DropboxTypes$team_log$EventDetailsSfTeamGrantAccessDetails
//     | DropboxTypes$team_log$EventDetailsSfTeamInviteDetails
//     | DropboxTypes$team_log$EventDetailsSfTeamInviteChangeRoleDetails
//     | DropboxTypes$team_log$EventDetailsSfTeamJoinDetails
//     | DropboxTypes$team_log$EventDetailsSfTeamJoinFromOobLinkDetails
//     | DropboxTypes$team_log$EventDetailsSfTeamUninviteDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentAddInviteesDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentAddLinkExpiryDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentAddLinkPasswordDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentAddMemberDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentChangeDownloadsPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentChangeInviteeRoleDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentChangeLinkAudienceDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentChangeLinkExpiryDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentChangeLinkPasswordDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentChangeMemberRoleDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentChangeViewerInfoPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentClaimInvitationDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentCopyDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentDownloadDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentRelinquishMembershipDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentRemoveInviteesDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentRemoveLinkExpiryDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentRemoveLinkPasswordDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentRemoveMemberDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentRequestAccessDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentUnshareDetails
//     | DropboxTypes$team_log$EventDetailsSharedContentViewDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderChangeLinkPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderChangeMembersInheritancePolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderChangeMembersManagementPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderChangeMembersPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderCreateDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderDeclineInvitationDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderMountDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderNestDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderTransferOwnershipDetails
//     | DropboxTypes$team_log$EventDetailsSharedFolderUnmountDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkAddExpiryDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkChangeExpiryDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkChangeVisibilityDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkCopyDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkCreateDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkDisableDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkDownloadDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkRemoveExpiryDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkShareDetails
//     | DropboxTypes$team_log$EventDetailsSharedLinkViewDetails
//     | DropboxTypes$team_log$EventDetailsSharedNoteOpenedDetails
//     | DropboxTypes$team_log$EventDetailsShmodelGroupShareDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseAccessGrantedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseAddMemberDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseArchivedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseCreatedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseDeleteCommentDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseEditedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseEditCommentDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseFileAddedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseFileDownloadDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseFileRemovedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseFileViewDetails
//     | DropboxTypes$team_log$EventDetailsShowcasePermanentlyDeletedDetails
//     | DropboxTypes$team_log$EventDetailsShowcasePostCommentDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseRemoveMemberDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseRenamedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseRequestAccessDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseResolveCommentDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseRestoredDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseTrashedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseTrashedDeprecatedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseUnresolveCommentDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseUntrashedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseUntrashedDeprecatedDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseViewDetails
//     | DropboxTypes$team_log$EventDetailsSsoAddCertDetails
//     | DropboxTypes$team_log$EventDetailsSsoAddLoginUrlDetails
//     | DropboxTypes$team_log$EventDetailsSsoAddLogoutUrlDetails
//     | DropboxTypes$team_log$EventDetailsSsoChangeCertDetails
//     | DropboxTypes$team_log$EventDetailsSsoChangeLoginUrlDetails
//     | DropboxTypes$team_log$EventDetailsSsoChangeLogoutUrlDetails
//     | DropboxTypes$team_log$EventDetailsSsoChangeSamlIdentityModeDetails
//     | DropboxTypes$team_log$EventDetailsSsoRemoveCertDetails
//     | DropboxTypes$team_log$EventDetailsSsoRemoveLoginUrlDetails
//     | DropboxTypes$team_log$EventDetailsSsoRemoveLogoutUrlDetails
//     | DropboxTypes$team_log$EventDetailsTeamFolderChangeStatusDetails
//     | DropboxTypes$team_log$EventDetailsTeamFolderCreateDetails
//     | DropboxTypes$team_log$EventDetailsTeamFolderDowngradeDetails
//     | DropboxTypes$team_log$EventDetailsTeamFolderPermanentlyDeleteDetails
//     | DropboxTypes$team_log$EventDetailsTeamFolderRenameDetails
//     | DropboxTypes$team_log$EventDetailsTeamSelectiveSyncSettingsChangedDetails
//     | DropboxTypes$team_log$EventDetailsAccountCaptureChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsAllowDownloadDisabledDetails
//     | DropboxTypes$team_log$EventDetailsAllowDownloadEnabledDetails
//     | DropboxTypes$team_log$EventDetailsCameraUploadsPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsDataPlacementRestrictionChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsDataPlacementRestrictionSatisfyPolicyDetails
//     | DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeDesktopPolicyDetails
//     | DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeMobilePolicyDetails
//     | DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeOverageActionDetails
//     | DropboxTypes$team_log$EventDetailsDeviceApprovalsChangeUnlinkActionDetails
//     | DropboxTypes$team_log$EventDetailsDirectoryRestrictionsAddMembersDetails
//     | DropboxTypes$team_log$EventDetailsDirectoryRestrictionsRemoveMembersDetails
//     | DropboxTypes$team_log$EventDetailsEmmAddExceptionDetails
//     | DropboxTypes$team_log$EventDetailsEmmChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsEmmRemoveExceptionDetails
//     | DropboxTypes$team_log$EventDetailsExtendedVersionHistoryChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsFileCommentsChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestsChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestsEmailsEnabledDetails
//     | DropboxTypes$team_log$EventDetailsFileRequestsEmailsRestrictedToTeamOnlyDetails
//     | DropboxTypes$team_log$EventDetailsGoogleSsoChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsGroupUserManagementChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsIntegrationPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsMemberRequestsChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsAddExceptionDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangeCapsTypePolicyDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsMemberSpaceLimitsRemoveExceptionDetails
//     | DropboxTypes$team_log$EventDetailsMemberSuggestionsChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsMicrosoftOfficeAddinChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsNetworkControlChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsPaperChangeDeploymentPolicyDetails
//     | DropboxTypes$team_log$EventDetailsPaperChangeMemberLinkPolicyDetails
//     | DropboxTypes$team_log$EventDetailsPaperChangeMemberPolicyDetails
//     | DropboxTypes$team_log$EventDetailsPaperChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsPaperDefaultFolderPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsPaperDesktopPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsPaperEnabledUsersGroupAdditionDetails
//     | DropboxTypes$team_log$EventDetailsPaperEnabledUsersGroupRemovalDetails
//     | DropboxTypes$team_log$EventDetailsPermanentDeleteChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsResellerSupportChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharingChangeFolderJoinPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharingChangeLinkPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSharingChangeMemberPolicyDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseChangeDownloadPolicyDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseChangeEnabledPolicyDetails
//     | DropboxTypes$team_log$EventDetailsShowcaseChangeExternalSharingPolicyDetails
//     | DropboxTypes$team_log$EventDetailsSmartSyncChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsSmartSyncNotOptOutDetails
//     | DropboxTypes$team_log$EventDetailsSmartSyncOptOutDetails
//     | DropboxTypes$team_log$EventDetailsSsoChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsTeamExtensionsPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsTeamSelectiveSyncPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsTfaChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsTwoAccountChangePolicyDetails
//     | DropboxTypes$team_log$EventDetailsViewerInfoPolicyChangedDetails
//     | DropboxTypes$team_log$EventDetailsWebSessionsChangeFixedLengthPolicyDetails
//     | DropboxTypes$team_log$EventDetailsWebSessionsChangeIdleLengthPolicyDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeFromDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeToDetails
//     | DropboxTypes$team_log$EventDetailsTeamProfileAddLogoDetails
//     | DropboxTypes$team_log$EventDetailsTeamProfileChangeDefaultLanguageDetails
//     | DropboxTypes$team_log$EventDetailsTeamProfileChangeLogoDetails
//     | DropboxTypes$team_log$EventDetailsTeamProfileChangeNameDetails
//     | DropboxTypes$team_log$EventDetailsTeamProfileRemoveLogoDetails
//     | DropboxTypes$team_log$EventDetailsTfaAddBackupPhoneDetails
//     | DropboxTypes$team_log$EventDetailsTfaAddSecurityKeyDetails
//     | DropboxTypes$team_log$EventDetailsTfaChangeBackupPhoneDetails
//     | DropboxTypes$team_log$EventDetailsTfaChangeStatusDetails
//     | DropboxTypes$team_log$EventDetailsTfaRemoveBackupPhoneDetails
//     | DropboxTypes$team_log$EventDetailsTfaRemoveSecurityKeyDetails
//     | DropboxTypes$team_log$EventDetailsTfaResetDetails
//     | DropboxTypes$team_log$EventDetailsGuestAdminChangeStatusDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestAcceptedDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestAcceptedShownToPrimaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestAcceptedShownToSecondaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestAutoCanceledDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestCanceledDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestCanceledShownToPrimaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestCanceledShownToSecondaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestExpiredDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestExpiredShownToPrimaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestExpiredShownToSecondaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestRejectedShownToPrimaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestRejectedShownToSecondaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestReminderDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestReminderShownToPrimaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestReminderShownToSecondaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestRevokedDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestSentShownToPrimaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsTeamMergeRequestSentShownToSecondaryTeamDetails
//     | DropboxTypes$team_log$EventDetailsMissingDetails
//     | DropboxTypes$team_log$EventDetailsOther;

//   /**
//   * (apps) Linked app for team
//   */
//   declare type DropboxTypes$team_log$EventTypeAppLinkTeam = {
//     ".tag": "app_link_team",
//     ...
//   } & DropboxTypes$team_log$AppLinkTeamType;

//   /**
//   * (apps) Linked app for member
//   */
//   declare type DropboxTypes$team_log$EventTypeAppLinkUser = {
//     ".tag": "app_link_user",
//     ...
//   } & DropboxTypes$team_log$AppLinkUserType;

//   /**
//   * (apps) Unlinked app for team
//   */
//   declare type DropboxTypes$team_log$EventTypeAppUnlinkTeam = {
//     ".tag": "app_unlink_team",
//     ...
//   } & DropboxTypes$team_log$AppUnlinkTeamType;

//   /**
//   * (apps) Unlinked app for member
//   */
//   declare type DropboxTypes$team_log$EventTypeAppUnlinkUser = {
//     ".tag": "app_unlink_user",
//     ...
//   } & DropboxTypes$team_log$AppUnlinkUserType;

//   /**
//   * (apps) Connected integration for member
//   */
//   declare type DropboxTypes$team_log$EventTypeIntegrationConnected = {
//     ".tag": "integration_connected",
//     ...
//   } & DropboxTypes$team_log$IntegrationConnectedType;

//   /**
//   * (apps) Disconnected integration for member
//   */
//   declare type DropboxTypes$team_log$EventTypeIntegrationDisconnected = {
//     ".tag": "integration_disconnected",
//     ...
//   } & DropboxTypes$team_log$IntegrationDisconnectedType;

//   /**
//   * (comments) Added file comment
//   */
//   declare type DropboxTypes$team_log$EventTypeFileAddComment = {
//     ".tag": "file_add_comment",
//     ...
//   } & DropboxTypes$team_log$FileAddCommentType;

//   /**
//   * (comments) Subscribed to or unsubscribed from comment notifications for
//   * file
//   */
//   declare type DropboxTypes$team_log$EventTypeFileChangeCommentSubscription = {
//     ".tag": "file_change_comment_subscription",
//     ...
//   } & DropboxTypes$team_log$FileChangeCommentSubscriptionType;

//   /**
//   * (comments) Deleted file comment
//   */
//   declare type DropboxTypes$team_log$EventTypeFileDeleteComment = {
//     ".tag": "file_delete_comment",
//     ...
//   } & DropboxTypes$team_log$FileDeleteCommentType;

//   /**
//   * (comments) Edited file comment
//   */
//   declare type DropboxTypes$team_log$EventTypeFileEditComment = {
//     ".tag": "file_edit_comment",
//     ...
//   } & DropboxTypes$team_log$FileEditCommentType;

//   /**
//   * (comments) Liked file comment (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeFileLikeComment = {
//     ".tag": "file_like_comment",
//     ...
//   } & DropboxTypes$team_log$FileLikeCommentType;

//   /**
//   * (comments) Resolved file comment
//   */
//   declare type DropboxTypes$team_log$EventTypeFileResolveComment = {
//     ".tag": "file_resolve_comment",
//     ...
//   } & DropboxTypes$team_log$FileResolveCommentType;

//   /**
//   * (comments) Unliked file comment (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeFileUnlikeComment = {
//     ".tag": "file_unlike_comment",
//     ...
//   } & DropboxTypes$team_log$FileUnlikeCommentType;

//   /**
//   * (comments) Unresolved file comment
//   */
//   declare type DropboxTypes$team_log$EventTypeFileUnresolveComment = {
//     ".tag": "file_unresolve_comment",
//     ...
//   } & DropboxTypes$team_log$FileUnresolveCommentType;

//   /**
//   * (devices) Changed IP address associated with active desktop session
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceChangeIpDesktop = {
//     ".tag": "device_change_ip_desktop",
//     ...
//   } & DropboxTypes$team_log$DeviceChangeIpDesktopType;

//   /**
//   * (devices) Changed IP address associated with active mobile session
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceChangeIpMobile = {
//     ".tag": "device_change_ip_mobile",
//     ...
//   } & DropboxTypes$team_log$DeviceChangeIpMobileType;

//   /**
//   * (devices) Changed IP address associated with active web session
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceChangeIpWeb = {
//     ".tag": "device_change_ip_web",
//     ...
//   } & DropboxTypes$team_log$DeviceChangeIpWebType;

//   /**
//   * (devices) Failed to delete all files from unlinked device
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceDeleteOnUnlinkFail = {
//     ".tag": "device_delete_on_unlink_fail",
//     ...
//   } & DropboxTypes$team_log$DeviceDeleteOnUnlinkFailType;

//   /**
//   * (devices) Deleted all files from unlinked device
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceDeleteOnUnlinkSuccess = {
//     ".tag": "device_delete_on_unlink_success",
//     ...
//   } & DropboxTypes$team_log$DeviceDeleteOnUnlinkSuccessType;

//   /**
//   * (devices) Failed to link device
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceLinkFail = {
//     ".tag": "device_link_fail",
//     ...
//   } & DropboxTypes$team_log$DeviceLinkFailType;

//   /**
//   * (devices) Linked device
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceLinkSuccess = {
//     ".tag": "device_link_success",
//     ...
//   } & DropboxTypes$team_log$DeviceLinkSuccessType;

//   /**
//   * (devices) Disabled device management (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceManagementDisabled = {
//     ".tag": "device_management_disabled",
//     ...
//   } & DropboxTypes$team_log$DeviceManagementDisabledType;

//   /**
//   * (devices) Enabled device management (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceManagementEnabled = {
//     ".tag": "device_management_enabled",
//     ...
//   } & DropboxTypes$team_log$DeviceManagementEnabledType;

//   /**
//   * (devices) Disconnected device
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceUnlink = {
//     ".tag": "device_unlink",
//     ...
//   } & DropboxTypes$team_log$DeviceUnlinkType;

//   /**
//   * (devices) Refreshed auth token used for setting up EMM
//   */
//   declare type DropboxTypes$team_log$EventTypeEmmRefreshAuthToken = {
//     ".tag": "emm_refresh_auth_token",
//     ...
//   } & DropboxTypes$team_log$EmmRefreshAuthTokenType;

//   /**
//   * (domains) Granted/revoked option to enable account capture on team
//   * domains
//   */
//   declare type DropboxTypes$team_log$EventTypeAccountCaptureChangeAvailability = {
//     ".tag": "account_capture_change_availability",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureChangeAvailabilityType;

//   /**
//   * (domains) Account-captured user migrated account to team
//   */
//   declare type DropboxTypes$team_log$EventTypeAccountCaptureMigrateAccount = {
//     ".tag": "account_capture_migrate_account",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureMigrateAccountType;

//   /**
//   * (domains) Sent proactive account capture email to all unmanaged members
//   */
//   declare type DropboxTypes$team_log$EventTypeAccountCaptureNotificationEmailsSent = {
//     ".tag": "account_capture_notification_emails_sent",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureNotificationEmailsSentType;

//   /**
//   * (domains) Account-captured user changed account email to personal email
//   */
//   declare type DropboxTypes$team_log$EventTypeAccountCaptureRelinquishAccount = {
//     ".tag": "account_capture_relinquish_account",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureRelinquishAccountType;

//   /**
//   * (domains) Disabled domain invites (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeDisabledDomainInvites = {
//     ".tag": "disabled_domain_invites",
//     ...
//   } & DropboxTypes$team_log$DisabledDomainInvitesType;

//   /**
//   * (domains) Approved user's request to join team
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainInvitesApproveRequestToJoinTeam = {
//     ".tag": "domain_invites_approve_request_to_join_team",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesApproveRequestToJoinTeamType;

//   /**
//   * (domains) Declined user's request to join team
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainInvitesDeclineRequestToJoinTeam = {
//     ".tag": "domain_invites_decline_request_to_join_team",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesDeclineRequestToJoinTeamType;

//   /**
//   * (domains) Sent domain invites to existing domain accounts (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainInvitesEmailExistingUsers = {
//     ".tag": "domain_invites_email_existing_users",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesEmailExistingUsersType;

//   /**
//   * (domains) Requested to join team
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainInvitesRequestToJoinTeam = {
//     ".tag": "domain_invites_request_to_join_team",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesRequestToJoinTeamType;

//   /**
//   * (domains) Disabled "Automatically invite new users" (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainInvitesSetInviteNewUserPrefToNo = {
//     ".tag": "domain_invites_set_invite_new_user_pref_to_no",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToNoType;

//   /**
//   * (domains) Enabled "Automatically invite new users" (deprecated, no longer
//   * logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainInvitesSetInviteNewUserPrefToYes = {
//     ".tag": "domain_invites_set_invite_new_user_pref_to_yes",
//     ...
//   } & DropboxTypes$team_log$DomainInvitesSetInviteNewUserPrefToYesType;

//   /**
//   * (domains) Failed to verify team domain
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainVerificationAddDomainFail = {
//     ".tag": "domain_verification_add_domain_fail",
//     ...
//   } & DropboxTypes$team_log$DomainVerificationAddDomainFailType;

//   /**
//   * (domains) Verified team domain
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainVerificationAddDomainSuccess = {
//     ".tag": "domain_verification_add_domain_success",
//     ...
//   } & DropboxTypes$team_log$DomainVerificationAddDomainSuccessType;

//   /**
//   * (domains) Removed domain from list of verified team domains
//   */
//   declare type DropboxTypes$team_log$EventTypeDomainVerificationRemoveDomain = {
//     ".tag": "domain_verification_remove_domain",
//     ...
//   } & DropboxTypes$team_log$DomainVerificationRemoveDomainType;

//   /**
//   * (domains) Enabled domain invites (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeEnabledDomainInvites = {
//     ".tag": "enabled_domain_invites",
//     ...
//   } & DropboxTypes$team_log$EnabledDomainInvitesType;

//   /**
//   * (file_operations) Created folders (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeCreateFolder = {
//     ".tag": "create_folder",
//     ...
//   } & DropboxTypes$team_log$CreateFolderType;

//   /**
//   * (file_operations) Added files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFileAdd = {
//     ".tag": "file_add",
//     ...
//   } & DropboxTypes$team_log$FileAddType;

//   /**
//   * (file_operations) Copied files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFileCopy = {
//     ".tag": "file_copy",
//     ...
//   } & DropboxTypes$team_log$FileCopyType;

//   /**
//   * (file_operations) Deleted files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFileDelete = {
//     ".tag": "file_delete",
//     ...
//   } & DropboxTypes$team_log$FileDeleteType;

//   /**
//   * (file_operations) Downloaded files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFileDownload = {
//     ".tag": "file_download",
//     ...
//   } & DropboxTypes$team_log$FileDownloadType;

//   /**
//   * (file_operations) Edited files
//   */
//   declare type DropboxTypes$team_log$EventTypeFileEdit = {
//     ".tag": "file_edit",
//     ...
//   } & DropboxTypes$team_log$FileEditType;

//   /**
//   * (file_operations) Created copy reference to file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeFileGetCopyReference = {
//     ".tag": "file_get_copy_reference",
//     ...
//   } & DropboxTypes$team_log$FileGetCopyReferenceType;

//   /**
//   * (file_operations) Moved files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFileMove = {
//     ".tag": "file_move",
//     ...
//   } & DropboxTypes$team_log$FileMoveType;

//   /**
//   * (file_operations) Permanently deleted files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFilePermanentlyDelete = {
//     ".tag": "file_permanently_delete",
//     ...
//   } & DropboxTypes$team_log$FilePermanentlyDeleteType;

//   /**
//   * (file_operations) Previewed files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFilePreview = {
//     ".tag": "file_preview",
//     ...
//   } & DropboxTypes$team_log$FilePreviewType;

//   /**
//   * (file_operations) Renamed files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRename = {
//     ".tag": "file_rename",
//     ...
//   } & DropboxTypes$team_log$FileRenameType;

//   /**
//   * (file_operations) Restored deleted files and/or folders
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRestore = {
//     ".tag": "file_restore",
//     ...
//   } & DropboxTypes$team_log$FileRestoreType;

//   /**
//   * (file_operations) Reverted files to previous version
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRevert = {
//     ".tag": "file_revert",
//     ...
//   } & DropboxTypes$team_log$FileRevertType;

//   /**
//   * (file_operations) Rolled back file actions
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRollbackChanges = {
//     ".tag": "file_rollback_changes",
//     ...
//   } & DropboxTypes$team_log$FileRollbackChangesType;

//   /**
//   * (file_operations) Saved file/folder using copy reference
//   */
//   declare type DropboxTypes$team_log$EventTypeFileSaveCopyReference = {
//     ".tag": "file_save_copy_reference",
//     ...
//   } & DropboxTypes$team_log$FileSaveCopyReferenceType;

//   /**
//   * (file_requests) Changed file request
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestChange = {
//     ".tag": "file_request_change",
//     ...
//   } & DropboxTypes$team_log$FileRequestChangeType;

//   /**
//   * (file_requests) Closed file request
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestClose = {
//     ".tag": "file_request_close",
//     ...
//   } & DropboxTypes$team_log$FileRequestCloseType;

//   /**
//   * (file_requests) Created file request
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestCreate = {
//     ".tag": "file_request_create",
//     ...
//   } & DropboxTypes$team_log$FileRequestCreateType;

//   /**
//   * (file_requests) Delete file request
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestDelete = {
//     ".tag": "file_request_delete",
//     ...
//   } & DropboxTypes$team_log$FileRequestDeleteType;

//   /**
//   * (file_requests) Received files for file request
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestReceiveFile = {
//     ".tag": "file_request_receive_file",
//     ...
//   } & DropboxTypes$team_log$FileRequestReceiveFileType;

//   /**
//   * (groups) Added external ID for group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupAddExternalId = {
//     ".tag": "group_add_external_id",
//     ...
//   } & DropboxTypes$team_log$GroupAddExternalIdType;

//   /**
//   * (groups) Added team members to group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupAddMember = {
//     ".tag": "group_add_member",
//     ...
//   } & DropboxTypes$team_log$GroupAddMemberType;

//   /**
//   * (groups) Changed external ID for group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupChangeExternalId = {
//     ".tag": "group_change_external_id",
//     ...
//   } & DropboxTypes$team_log$GroupChangeExternalIdType;

//   /**
//   * (groups) Changed group management type
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupChangeManagementType = {
//     ".tag": "group_change_management_type",
//     ...
//   } & DropboxTypes$team_log$GroupChangeManagementTypeType;

//   /**
//   * (groups) Changed manager permissions of group member
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupChangeMemberRole = {
//     ".tag": "group_change_member_role",
//     ...
//   } & DropboxTypes$team_log$GroupChangeMemberRoleType;

//   /**
//   * (groups) Created group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupCreate = {
//     ".tag": "group_create",
//     ...
//   } & DropboxTypes$team_log$GroupCreateType;

//   /**
//   * (groups) Deleted group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupDelete = {
//     ".tag": "group_delete",
//     ...
//   } & DropboxTypes$team_log$GroupDeleteType;

//   /**
//   * (groups) Updated group (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupDescriptionUpdated = {
//     ".tag": "group_description_updated",
//     ...
//   } & DropboxTypes$team_log$GroupDescriptionUpdatedType;

//   /**
//   * (groups) Updated group join policy (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupJoinPolicyUpdated = {
//     ".tag": "group_join_policy_updated",
//     ...
//   } & DropboxTypes$team_log$GroupJoinPolicyUpdatedType;

//   /**
//   * (groups) Moved group (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupMoved = {
//     ".tag": "group_moved",
//     ...
//   } & DropboxTypes$team_log$GroupMovedType;

//   /**
//   * (groups) Removed external ID for group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupRemoveExternalId = {
//     ".tag": "group_remove_external_id",
//     ...
//   } & DropboxTypes$team_log$GroupRemoveExternalIdType;

//   /**
//   * (groups) Removed team members from group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupRemoveMember = {
//     ".tag": "group_remove_member",
//     ...
//   } & DropboxTypes$team_log$GroupRemoveMemberType;

//   /**
//   * (groups) Renamed group
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupRename = {
//     ".tag": "group_rename",
//     ...
//   } & DropboxTypes$team_log$GroupRenameType;

//   /**
//   * (logins) Failed to sign in via EMM (deprecated, replaced by 'Failed to
//   * sign in')
//   */
//   declare type DropboxTypes$team_log$EventTypeEmmError = {
//     ".tag": "emm_error",
//     ...
//   } & DropboxTypes$team_log$EmmErrorType;

//   /**
//   * (logins) Started trusted team admin session
//   */
//   declare type DropboxTypes$team_log$EventTypeGuestAdminSignedInViaTrustedTeams = {
//     ".tag": "guest_admin_signed_in_via_trusted_teams",
//     ...
//   } & DropboxTypes$team_log$GuestAdminSignedInViaTrustedTeamsType;

//   /**
//   * (logins) Ended trusted team admin session
//   */
//   declare type DropboxTypes$team_log$EventTypeGuestAdminSignedOutViaTrustedTeams = {
//     ".tag": "guest_admin_signed_out_via_trusted_teams",
//     ...
//   } & DropboxTypes$team_log$GuestAdminSignedOutViaTrustedTeamsType;

//   /**
//   * (logins) Failed to sign in
//   */
//   declare type DropboxTypes$team_log$EventTypeLoginFail = {
//     ".tag": "login_fail",
//     ...
//   } & DropboxTypes$team_log$LoginFailType;

//   /**
//   * (logins) Signed in
//   */
//   declare type DropboxTypes$team_log$EventTypeLoginSuccess = {
//     ".tag": "login_success",
//     ...
//   } & DropboxTypes$team_log$LoginSuccessType;

//   /**
//   * (logins) Signed out
//   */
//   declare type DropboxTypes$team_log$EventTypeLogout = {
//     ".tag": "logout",
//     ...
//   } & DropboxTypes$team_log$LogoutType;

//   /**
//   * (logins) Ended reseller support session
//   */
//   declare type DropboxTypes$team_log$EventTypeResellerSupportSessionEnd = {
//     ".tag": "reseller_support_session_end",
//     ...
//   } & DropboxTypes$team_log$ResellerSupportSessionEndType;

//   /**
//   * (logins) Started reseller support session
//   */
//   declare type DropboxTypes$team_log$EventTypeResellerSupportSessionStart = {
//     ".tag": "reseller_support_session_start",
//     ...
//   } & DropboxTypes$team_log$ResellerSupportSessionStartType;

//   /**
//   * (logins) Ended admin sign-in-as session
//   */
//   declare type DropboxTypes$team_log$EventTypeSignInAsSessionEnd = {
//     ".tag": "sign_in_as_session_end",
//     ...
//   } & DropboxTypes$team_log$SignInAsSessionEndType;

//   /**
//   * (logins) Started admin sign-in-as session
//   */
//   declare type DropboxTypes$team_log$EventTypeSignInAsSessionStart = {
//     ".tag": "sign_in_as_session_start",
//     ...
//   } & DropboxTypes$team_log$SignInAsSessionStartType;

//   /**
//   * (logins) Failed to sign in via SSO (deprecated, replaced by 'Failed to
//   * sign in')
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoError = {
//     ".tag": "sso_error",
//     ...
//   } & DropboxTypes$team_log$SsoErrorType;

//   /**
//   * (members) Added an external ID for team member
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberAddExternalId = {
//     ".tag": "member_add_external_id",
//     ...
//   } & DropboxTypes$team_log$MemberAddExternalIdType;

//   /**
//   * (members) Added team member name
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberAddName = {
//     ".tag": "member_add_name",
//     ...
//   } & DropboxTypes$team_log$MemberAddNameType;

//   /**
//   * (members) Changed team member admin role
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberChangeAdminRole = {
//     ".tag": "member_change_admin_role",
//     ...
//   } & DropboxTypes$team_log$MemberChangeAdminRoleType;

//   /**
//   * (members) Changed team member email
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberChangeEmail = {
//     ".tag": "member_change_email",
//     ...
//   } & DropboxTypes$team_log$MemberChangeEmailType;

//   /**
//   * (members) Changed the external ID for team member
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberChangeExternalId = {
//     ".tag": "member_change_external_id",
//     ...
//   } & DropboxTypes$team_log$MemberChangeExternalIdType;

//   /**
//   * (members) Changed membership type (limited/full) of member (deprecated,
//   * no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberChangeMembershipType = {
//     ".tag": "member_change_membership_type",
//     ...
//   } & DropboxTypes$team_log$MemberChangeMembershipTypeType;

//   /**
//   * (members) Changed team member name
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberChangeName = {
//     ".tag": "member_change_name",
//     ...
//   } & DropboxTypes$team_log$MemberChangeNameType;

//   /**
//   * (members) Changed member status (invited, joined, suspended, etc.)
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberChangeStatus = {
//     ".tag": "member_change_status",
//     ...
//   } & DropboxTypes$team_log$MemberChangeStatusType;

//   /**
//   * (members) Cleared manually added contacts
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberDeleteManualContacts = {
//     ".tag": "member_delete_manual_contacts",
//     ...
//   } & DropboxTypes$team_log$MemberDeleteManualContactsType;

//   /**
//   * (members) Permanently deleted contents of deleted team member account
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberPermanentlyDeleteAccountContents = {
//     ".tag": "member_permanently_delete_account_contents",
//     ...
//   } & DropboxTypes$team_log$MemberPermanentlyDeleteAccountContentsType;

//   /**
//   * (members) Removed the external ID for team member
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberRemoveExternalId = {
//     ".tag": "member_remove_external_id",
//     ...
//   } & DropboxTypes$team_log$MemberRemoveExternalIdType;

//   /**
//   * (members) Set custom member space limit
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsAddCustomQuota = {
//     ".tag": "member_space_limits_add_custom_quota",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsAddCustomQuotaType;

//   /**
//   * (members) Changed custom member space limit
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangeCustomQuota = {
//     ".tag": "member_space_limits_change_custom_quota",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangeCustomQuotaType;

//   /**
//   * (members) Changed space limit status
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangeStatus = {
//     ".tag": "member_space_limits_change_status",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangeStatusType;

//   /**
//   * (members) Removed custom member space limit
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsRemoveCustomQuota = {
//     ".tag": "member_space_limits_remove_custom_quota",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsRemoveCustomQuotaType;

//   /**
//   * (members) Suggested person to add to team
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSuggest = {
//     ".tag": "member_suggest",
//     ...
//   } & DropboxTypes$team_log$MemberSuggestType;

//   /**
//   * (members) Transferred contents of deleted member account to another
//   * member
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberTransferAccountContents = {
//     ".tag": "member_transfer_account_contents",
//     ...
//   } & DropboxTypes$team_log$MemberTransferAccountContentsType;

//   /**
//   * (members) Secondary mails policy changed
//   */
//   declare type DropboxTypes$team_log$EventTypeSecondaryMailsPolicyChanged = {
//     ".tag": "secondary_mails_policy_changed",
//     ...
//   } & DropboxTypes$team_log$SecondaryMailsPolicyChangedType;

//   /**
//   * (paper) Added team member to Paper doc/folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentAddMember = {
//     ".tag": "paper_content_add_member",
//     ...
//   } & DropboxTypes$team_log$PaperContentAddMemberType;

//   /**
//   * (paper) Added Paper doc/folder to folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentAddToFolder = {
//     ".tag": "paper_content_add_to_folder",
//     ...
//   } & DropboxTypes$team_log$PaperContentAddToFolderType;

//   /**
//   * (paper) Archived Paper doc/folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentArchive = {
//     ".tag": "paper_content_archive",
//     ...
//   } & DropboxTypes$team_log$PaperContentArchiveType;

//   /**
//   * (paper) Created Paper doc/folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentCreate = {
//     ".tag": "paper_content_create",
//     ...
//   } & DropboxTypes$team_log$PaperContentCreateType;

//   /**
//   * (paper) Permanently deleted Paper doc/folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentPermanentlyDelete = {
//     ".tag": "paper_content_permanently_delete",
//     ...
//   } & DropboxTypes$team_log$PaperContentPermanentlyDeleteType;

//   /**
//   * (paper) Removed Paper doc/folder from folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentRemoveFromFolder = {
//     ".tag": "paper_content_remove_from_folder",
//     ...
//   } & DropboxTypes$team_log$PaperContentRemoveFromFolderType;

//   /**
//   * (paper) Removed team member from Paper doc/folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentRemoveMember = {
//     ".tag": "paper_content_remove_member",
//     ...
//   } & DropboxTypes$team_log$PaperContentRemoveMemberType;

//   /**
//   * (paper) Renamed Paper doc/folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentRename = {
//     ".tag": "paper_content_rename",
//     ...
//   } & DropboxTypes$team_log$PaperContentRenameType;

//   /**
//   * (paper) Restored archived Paper doc/folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperContentRestore = {
//     ".tag": "paper_content_restore",
//     ...
//   } & DropboxTypes$team_log$PaperContentRestoreType;

//   /**
//   * (paper) Added Paper doc comment
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocAddComment = {
//     ".tag": "paper_doc_add_comment",
//     ...
//   } & DropboxTypes$team_log$PaperDocAddCommentType;

//   /**
//   * (paper) Changed team member permissions for Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocChangeMemberRole = {
//     ".tag": "paper_doc_change_member_role",
//     ...
//   } & DropboxTypes$team_log$PaperDocChangeMemberRoleType;

//   /**
//   * (paper) Changed sharing setting for Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocChangeSharingPolicy = {
//     ".tag": "paper_doc_change_sharing_policy",
//     ...
//   } & DropboxTypes$team_log$PaperDocChangeSharingPolicyType;

//   /**
//   * (paper) Followed/unfollowed Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocChangeSubscription = {
//     ".tag": "paper_doc_change_subscription",
//     ...
//   } & DropboxTypes$team_log$PaperDocChangeSubscriptionType;

//   /**
//   * (paper) Archived Paper doc (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocDeleted = {
//     ".tag": "paper_doc_deleted",
//     ...
//   } & DropboxTypes$team_log$PaperDocDeletedType;

//   /**
//   * (paper) Deleted Paper doc comment
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocDeleteComment = {
//     ".tag": "paper_doc_delete_comment",
//     ...
//   } & DropboxTypes$team_log$PaperDocDeleteCommentType;

//   /**
//   * (paper) Downloaded Paper doc in specific format
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocDownload = {
//     ".tag": "paper_doc_download",
//     ...
//   } & DropboxTypes$team_log$PaperDocDownloadType;

//   /**
//   * (paper) Edited Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocEdit = {
//     ".tag": "paper_doc_edit",
//     ...
//   } & DropboxTypes$team_log$PaperDocEditType;

//   /**
//   * (paper) Edited Paper doc comment
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocEditComment = {
//     ".tag": "paper_doc_edit_comment",
//     ...
//   } & DropboxTypes$team_log$PaperDocEditCommentType;

//   /**
//   * (paper) Followed Paper doc (deprecated, replaced by 'Followed/unfollowed
//   * Paper doc')
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocFollowed = {
//     ".tag": "paper_doc_followed",
//     ...
//   } & DropboxTypes$team_log$PaperDocFollowedType;

//   /**
//   * (paper) Mentioned team member in Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocMention = {
//     ".tag": "paper_doc_mention",
//     ...
//   } & DropboxTypes$team_log$PaperDocMentionType;

//   /**
//   * (paper) Transferred ownership of Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocOwnershipChanged = {
//     ".tag": "paper_doc_ownership_changed",
//     ...
//   } & DropboxTypes$team_log$PaperDocOwnershipChangedType;

//   /**
//   * (paper) Requested access to Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocRequestAccess = {
//     ".tag": "paper_doc_request_access",
//     ...
//   } & DropboxTypes$team_log$PaperDocRequestAccessType;

//   /**
//   * (paper) Resolved Paper doc comment
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocResolveComment = {
//     ".tag": "paper_doc_resolve_comment",
//     ...
//   } & DropboxTypes$team_log$PaperDocResolveCommentType;

//   /**
//   * (paper) Restored Paper doc to previous version
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocRevert = {
//     ".tag": "paper_doc_revert",
//     ...
//   } & DropboxTypes$team_log$PaperDocRevertType;

//   /**
//   * (paper) Shared Paper doc via Slack
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocSlackShare = {
//     ".tag": "paper_doc_slack_share",
//     ...
//   } & DropboxTypes$team_log$PaperDocSlackShareType;

//   /**
//   * (paper) Shared Paper doc with team member (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocTeamInvite = {
//     ".tag": "paper_doc_team_invite",
//     ...
//   } & DropboxTypes$team_log$PaperDocTeamInviteType;

//   /**
//   * (paper) Deleted Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocTrashed = {
//     ".tag": "paper_doc_trashed",
//     ...
//   } & DropboxTypes$team_log$PaperDocTrashedType;

//   /**
//   * (paper) Unresolved Paper doc comment
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocUnresolveComment = {
//     ".tag": "paper_doc_unresolve_comment",
//     ...
//   } & DropboxTypes$team_log$PaperDocUnresolveCommentType;

//   /**
//   * (paper) Restored Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocUntrashed = {
//     ".tag": "paper_doc_untrashed",
//     ...
//   } & DropboxTypes$team_log$PaperDocUntrashedType;

//   /**
//   * (paper) Viewed Paper doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDocView = {
//     ".tag": "paper_doc_view",
//     ...
//   } & DropboxTypes$team_log$PaperDocViewType;

//   /**
//   * (paper) Changed Paper external sharing setting to anyone (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperExternalViewAllow = {
//     ".tag": "paper_external_view_allow",
//     ...
//   } & DropboxTypes$team_log$PaperExternalViewAllowType;

//   /**
//   * (paper) Changed Paper external sharing setting to default team
//   * (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperExternalViewDefaultTeam = {
//     ".tag": "paper_external_view_default_team",
//     ...
//   } & DropboxTypes$team_log$PaperExternalViewDefaultTeamType;

//   /**
//   * (paper) Changed Paper external sharing setting to team-only (deprecated,
//   * no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperExternalViewForbid = {
//     ".tag": "paper_external_view_forbid",
//     ...
//   } & DropboxTypes$team_log$PaperExternalViewForbidType;

//   /**
//   * (paper) Followed/unfollowed Paper folder
//   */
//   declare type DropboxTypes$team_log$EventTypePaperFolderChangeSubscription = {
//     ".tag": "paper_folder_change_subscription",
//     ...
//   } & DropboxTypes$team_log$PaperFolderChangeSubscriptionType;

//   /**
//   * (paper) Archived Paper folder (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperFolderDeleted = {
//     ".tag": "paper_folder_deleted",
//     ...
//   } & DropboxTypes$team_log$PaperFolderDeletedType;

//   /**
//   * (paper) Followed Paper folder (deprecated, replaced by
//   * 'Followed/unfollowed Paper folder')
//   */
//   declare type DropboxTypes$team_log$EventTypePaperFolderFollowed = {
//     ".tag": "paper_folder_followed",
//     ...
//   } & DropboxTypes$team_log$PaperFolderFollowedType;

//   /**
//   * (paper) Shared Paper folder with member (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperFolderTeamInvite = {
//     ".tag": "paper_folder_team_invite",
//     ...
//   } & DropboxTypes$team_log$PaperFolderTeamInviteType;

//   /**
//   * (paper) Published doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperPublishedLinkCreate = {
//     ".tag": "paper_published_link_create",
//     ...
//   } & DropboxTypes$team_log$PaperPublishedLinkCreateType;

//   /**
//   * (paper) Unpublished doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperPublishedLinkDisabled = {
//     ".tag": "paper_published_link_disabled",
//     ...
//   } & DropboxTypes$team_log$PaperPublishedLinkDisabledType;

//   /**
//   * (paper) Viewed published doc
//   */
//   declare type DropboxTypes$team_log$EventTypePaperPublishedLinkView = {
//     ".tag": "paper_published_link_view",
//     ...
//   } & DropboxTypes$team_log$PaperPublishedLinkViewType;

//   /**
//   * (passwords) Changed password
//   */
//   declare type DropboxTypes$team_log$EventTypePasswordChange = {
//     ".tag": "password_change",
//     ...
//   } & DropboxTypes$team_log$PasswordChangeType;

//   /**
//   * (passwords) Reset password
//   */
//   declare type DropboxTypes$team_log$EventTypePasswordReset = {
//     ".tag": "password_reset",
//     ...
//   } & DropboxTypes$team_log$PasswordResetType;

//   /**
//   * (passwords) Reset all team member passwords
//   */
//   declare type DropboxTypes$team_log$EventTypePasswordResetAll = {
//     ".tag": "password_reset_all",
//     ...
//   } & DropboxTypes$team_log$PasswordResetAllType;

//   /**
//   * (reports) Created EMM-excluded users report
//   */
//   declare type DropboxTypes$team_log$EventTypeEmmCreateExceptionsReport = {
//     ".tag": "emm_create_exceptions_report",
//     ...
//   } & DropboxTypes$team_log$EmmCreateExceptionsReportType;

//   /**
//   * (reports) Created EMM mobile app usage report
//   */
//   declare type DropboxTypes$team_log$EventTypeEmmCreateUsageReport = {
//     ".tag": "emm_create_usage_report",
//     ...
//   } & DropboxTypes$team_log$EmmCreateUsageReportType;

//   /**
//   * (reports) Created member data report
//   */
//   declare type DropboxTypes$team_log$EventTypeExportMembersReport = {
//     ".tag": "export_members_report",
//     ...
//   } & DropboxTypes$team_log$ExportMembersReportType;

//   /**
//   * (reports) Exported all team Paper docs
//   */
//   declare type DropboxTypes$team_log$EventTypePaperAdminExportStart = {
//     ".tag": "paper_admin_export_start",
//     ...
//   } & DropboxTypes$team_log$PaperAdminExportStartType;

//   /**
//   * (reports) Created Smart Sync non-admin devices report
//   */
//   declare type DropboxTypes$team_log$EventTypeSmartSyncCreateAdminPrivilegeReport = {
//     ".tag": "smart_sync_create_admin_privilege_report",
//     ...
//   } & DropboxTypes$team_log$SmartSyncCreateAdminPrivilegeReportType;

//   /**
//   * (reports) Created team activity report
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamActivityCreateReport = {
//     ".tag": "team_activity_create_report",
//     ...
//   } & DropboxTypes$team_log$TeamActivityCreateReportType;

//   /**
//   * (reports) Couldn't generate team activity report
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamActivityCreateReportFail = {
//     ".tag": "team_activity_create_report_fail",
//     ...
//   } & DropboxTypes$team_log$TeamActivityCreateReportFailType;

//   /**
//   * (sharing) Shared album
//   */
//   declare type DropboxTypes$team_log$EventTypeCollectionShare = {
//     ".tag": "collection_share",
//     ...
//   } & DropboxTypes$team_log$CollectionShareType;

//   /**
//   * (sharing) Changed Paper doc to invite-only (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeNoteAclInviteOnly = {
//     ".tag": "note_acl_invite_only",
//     ...
//   } & DropboxTypes$team_log$NoteAclInviteOnlyType;

//   /**
//   * (sharing) Changed Paper doc to link-accessible (deprecated, no longer
//   * logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeNoteAclLink = {
//     ".tag": "note_acl_link",
//     ...
//   } & DropboxTypes$team_log$NoteAclLinkType;

//   /**
//   * (sharing) Changed Paper doc to link-accessible for team (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeNoteAclTeamLink = {
//     ".tag": "note_acl_team_link",
//     ...
//   } & DropboxTypes$team_log$NoteAclTeamLinkType;

//   /**
//   * (sharing) Shared Paper doc (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeNoteShared = {
//     ".tag": "note_shared",
//     ...
//   } & DropboxTypes$team_log$NoteSharedType;

//   /**
//   * (sharing) Shared received Paper doc (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeNoteShareReceive = {
//     ".tag": "note_share_receive",
//     ...
//   } & DropboxTypes$team_log$NoteShareReceiveType;

//   /**
//   * (sharing) Opened shared Paper doc (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeOpenNoteShared = {
//     ".tag": "open_note_shared",
//     ...
//   } & DropboxTypes$team_log$OpenNoteSharedType;

//   /**
//   * (sharing) Added team to shared folder (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfAddGroup = {
//     ".tag": "sf_add_group",
//     ...
//   } & DropboxTypes$team_log$SfAddGroupType;

//   /**
//   * (sharing) Allowed non-collaborators to view links to files in shared
//   * folder (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfAllowNonMembersToViewSharedLinks = {
//     ".tag": "sf_allow_non_members_to_view_shared_links",
//     ...
//   } & DropboxTypes$team_log$SfAllowNonMembersToViewSharedLinksType;

//   /**
//   * (sharing) Set team members to see warning before sharing folders outside
//   * team (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfExternalInviteWarn = {
//     ".tag": "sf_external_invite_warn",
//     ...
//   } & DropboxTypes$team_log$SfExternalInviteWarnType;

//   /**
//   * (sharing) Invited Facebook users to shared folder (deprecated, no longer
//   * logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfFbInvite = {
//     ".tag": "sf_fb_invite",
//     ...
//   } & DropboxTypes$team_log$SfFbInviteType;

//   /**
//   * (sharing) Changed Facebook user's role in shared folder (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfFbInviteChangeRole = {
//     ".tag": "sf_fb_invite_change_role",
//     ...
//   } & DropboxTypes$team_log$SfFbInviteChangeRoleType;

//   /**
//   * (sharing) Uninvited Facebook user from shared folder (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfFbUninvite = {
//     ".tag": "sf_fb_uninvite",
//     ...
//   } & DropboxTypes$team_log$SfFbUninviteType;

//   /**
//   * (sharing) Invited group to shared folder (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfInviteGroup = {
//     ".tag": "sf_invite_group",
//     ...
//   } & DropboxTypes$team_log$SfInviteGroupType;

//   /**
//   * (sharing) Granted access to shared folder (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfTeamGrantAccess = {
//     ".tag": "sf_team_grant_access",
//     ...
//   } & DropboxTypes$team_log$SfTeamGrantAccessType;

//   /**
//   * (sharing) Invited team members to shared folder (deprecated, replaced by
//   * 'Invited user to Dropbox and added them to shared file/folder')
//   */
//   declare type DropboxTypes$team_log$EventTypeSfTeamInvite = {
//     ".tag": "sf_team_invite",
//     ...
//   } & DropboxTypes$team_log$SfTeamInviteType;

//   /**
//   * (sharing) Changed team member's role in shared folder (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfTeamInviteChangeRole = {
//     ".tag": "sf_team_invite_change_role",
//     ...
//   } & DropboxTypes$team_log$SfTeamInviteChangeRoleType;

//   /**
//   * (sharing) Joined team member's shared folder (deprecated, no longer
//   * logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfTeamJoin = {
//     ".tag": "sf_team_join",
//     ...
//   } & DropboxTypes$team_log$SfTeamJoinType;

//   /**
//   * (sharing) Joined team member's shared folder from link (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSfTeamJoinFromOobLink = {
//     ".tag": "sf_team_join_from_oob_link",
//     ...
//   } & DropboxTypes$team_log$SfTeamJoinFromOobLinkType;

//   /**
//   * (sharing) Unshared folder with team member (deprecated, replaced by
//   * 'Removed invitee from shared file/folder before invite was accepted')
//   */
//   declare type DropboxTypes$team_log$EventTypeSfTeamUninvite = {
//     ".tag": "sf_team_uninvite",
//     ...
//   } & DropboxTypes$team_log$SfTeamUninviteType;

//   /**
//   * (sharing) Invited user to Dropbox and added them to shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentAddInvitees = {
//     ".tag": "shared_content_add_invitees",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddInviteesType;

//   /**
//   * (sharing) Added expiration date to link for shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentAddLinkExpiry = {
//     ".tag": "shared_content_add_link_expiry",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddLinkExpiryType;

//   /**
//   * (sharing) Added password to link for shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentAddLinkPassword = {
//     ".tag": "shared_content_add_link_password",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddLinkPasswordType;

//   /**
//   * (sharing) Added users and/or groups to shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentAddMember = {
//     ".tag": "shared_content_add_member",
//     ...
//   } & DropboxTypes$team_log$SharedContentAddMemberType;

//   /**
//   * (sharing) Changed whether members can download shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentChangeDownloadsPolicy = {
//     ".tag": "shared_content_change_downloads_policy",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeDownloadsPolicyType;

//   /**
//   * (sharing) Changed access type of invitee to shared file/folder before
//   * invite was accepted
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentChangeInviteeRole = {
//     ".tag": "shared_content_change_invitee_role",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeInviteeRoleType;

//   /**
//   * (sharing) Changed link audience of shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentChangeLinkAudience = {
//     ".tag": "shared_content_change_link_audience",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeLinkAudienceType;

//   /**
//   * (sharing) Changed link expiration of shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentChangeLinkExpiry = {
//     ".tag": "shared_content_change_link_expiry",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeLinkExpiryType;

//   /**
//   * (sharing) Changed link password of shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentChangeLinkPassword = {
//     ".tag": "shared_content_change_link_password",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeLinkPasswordType;

//   /**
//   * (sharing) Changed access type of shared file/folder member
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentChangeMemberRole = {
//     ".tag": "shared_content_change_member_role",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeMemberRoleType;

//   /**
//   * (sharing) Changed whether members can see who viewed shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentChangeViewerInfoPolicy = {
//     ".tag": "shared_content_change_viewer_info_policy",
//     ...
//   } & DropboxTypes$team_log$SharedContentChangeViewerInfoPolicyType;

//   /**
//   * (sharing) Acquired membership of shared file/folder by accepting invite
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentClaimInvitation = {
//     ".tag": "shared_content_claim_invitation",
//     ...
//   } & DropboxTypes$team_log$SharedContentClaimInvitationType;

//   /**
//   * (sharing) Copied shared file/folder to own Dropbox
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentCopy = {
//     ".tag": "shared_content_copy",
//     ...
//   } & DropboxTypes$team_log$SharedContentCopyType;

//   /**
//   * (sharing) Downloaded shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentDownload = {
//     ".tag": "shared_content_download",
//     ...
//   } & DropboxTypes$team_log$SharedContentDownloadType;

//   /**
//   * (sharing) Left shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentRelinquishMembership = {
//     ".tag": "shared_content_relinquish_membership",
//     ...
//   } & DropboxTypes$team_log$SharedContentRelinquishMembershipType;

//   /**
//   * (sharing) Removed invitee from shared file/folder before invite was
//   * accepted
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentRemoveInvitees = {
//     ".tag": "shared_content_remove_invitees",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveInviteesType;

//   /**
//   * (sharing) Removed link expiration date of shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentRemoveLinkExpiry = {
//     ".tag": "shared_content_remove_link_expiry",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveLinkExpiryType;

//   /**
//   * (sharing) Removed link password of shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentRemoveLinkPassword = {
//     ".tag": "shared_content_remove_link_password",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveLinkPasswordType;

//   /**
//   * (sharing) Removed user/group from shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentRemoveMember = {
//     ".tag": "shared_content_remove_member",
//     ...
//   } & DropboxTypes$team_log$SharedContentRemoveMemberType;

//   /**
//   * (sharing) Requested access to shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentRequestAccess = {
//     ".tag": "shared_content_request_access",
//     ...
//   } & DropboxTypes$team_log$SharedContentRequestAccessType;

//   /**
//   * (sharing) Unshared file/folder by clearing membership and turning off
//   * link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentUnshare = {
//     ".tag": "shared_content_unshare",
//     ...
//   } & DropboxTypes$team_log$SharedContentUnshareType;

//   /**
//   * (sharing) Previewed shared file/folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedContentView = {
//     ".tag": "shared_content_view",
//     ...
//   } & DropboxTypes$team_log$SharedContentViewType;

//   /**
//   * (sharing) Changed who can access shared folder via link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderChangeLinkPolicy = {
//     ".tag": "shared_folder_change_link_policy",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeLinkPolicyType;

//   /**
//   * (sharing) Changed whether shared folder inherits members from parent
//   * folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderChangeMembersInheritancePolicy = {
//     ".tag": "shared_folder_change_members_inheritance_policy",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeMembersInheritancePolicyType;

//   /**
//   * (sharing) Changed who can add/remove members of shared folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderChangeMembersManagementPolicy = {
//     ".tag": "shared_folder_change_members_management_policy",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeMembersManagementPolicyType;

//   /**
//   * (sharing) Changed who can become member of shared folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderChangeMembersPolicy = {
//     ".tag": "shared_folder_change_members_policy",
//     ...
//   } & DropboxTypes$team_log$SharedFolderChangeMembersPolicyType;

//   /**
//   * (sharing) Created shared folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderCreate = {
//     ".tag": "shared_folder_create",
//     ...
//   } & DropboxTypes$team_log$SharedFolderCreateType;

//   /**
//   * (sharing) Declined team member's invite to shared folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderDeclineInvitation = {
//     ".tag": "shared_folder_decline_invitation",
//     ...
//   } & DropboxTypes$team_log$SharedFolderDeclineInvitationType;

//   /**
//   * (sharing) Added shared folder to own Dropbox
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderMount = {
//     ".tag": "shared_folder_mount",
//     ...
//   } & DropboxTypes$team_log$SharedFolderMountType;

//   /**
//   * (sharing) Changed parent of shared folder
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderNest = {
//     ".tag": "shared_folder_nest",
//     ...
//   } & DropboxTypes$team_log$SharedFolderNestType;

//   /**
//   * (sharing) Transferred ownership of shared folder to another member
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderTransferOwnership = {
//     ".tag": "shared_folder_transfer_ownership",
//     ...
//   } & DropboxTypes$team_log$SharedFolderTransferOwnershipType;

//   /**
//   * (sharing) Deleted shared folder from Dropbox
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedFolderUnmount = {
//     ".tag": "shared_folder_unmount",
//     ...
//   } & DropboxTypes$team_log$SharedFolderUnmountType;

//   /**
//   * (sharing) Added shared link expiration date
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkAddExpiry = {
//     ".tag": "shared_link_add_expiry",
//     ...
//   } & DropboxTypes$team_log$SharedLinkAddExpiryType;

//   /**
//   * (sharing) Changed shared link expiration date
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkChangeExpiry = {
//     ".tag": "shared_link_change_expiry",
//     ...
//   } & DropboxTypes$team_log$SharedLinkChangeExpiryType;

//   /**
//   * (sharing) Changed visibility of shared link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkChangeVisibility = {
//     ".tag": "shared_link_change_visibility",
//     ...
//   } & DropboxTypes$team_log$SharedLinkChangeVisibilityType;

//   /**
//   * (sharing) Added file/folder to Dropbox from shared link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkCopy = {
//     ".tag": "shared_link_copy",
//     ...
//   } & DropboxTypes$team_log$SharedLinkCopyType;

//   /**
//   * (sharing) Created shared link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkCreate = {
//     ".tag": "shared_link_create",
//     ...
//   } & DropboxTypes$team_log$SharedLinkCreateType;

//   /**
//   * (sharing) Removed shared link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkDisable = {
//     ".tag": "shared_link_disable",
//     ...
//   } & DropboxTypes$team_log$SharedLinkDisableType;

//   /**
//   * (sharing) Downloaded file/folder from shared link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkDownload = {
//     ".tag": "shared_link_download",
//     ...
//   } & DropboxTypes$team_log$SharedLinkDownloadType;

//   /**
//   * (sharing) Removed shared link expiration date
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkRemoveExpiry = {
//     ".tag": "shared_link_remove_expiry",
//     ...
//   } & DropboxTypes$team_log$SharedLinkRemoveExpiryType;

//   /**
//   * (sharing) Added members as audience of shared link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkShare = {
//     ".tag": "shared_link_share",
//     ...
//   } & DropboxTypes$team_log$SharedLinkShareType;

//   /**
//   * (sharing) Opened shared link
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedLinkView = {
//     ".tag": "shared_link_view",
//     ...
//   } & DropboxTypes$team_log$SharedLinkViewType;

//   /**
//   * (sharing) Opened shared Paper doc (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeSharedNoteOpened = {
//     ".tag": "shared_note_opened",
//     ...
//   } & DropboxTypes$team_log$SharedNoteOpenedType;

//   /**
//   * (sharing) Shared link with group (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeShmodelGroupShare = {
//     ".tag": "shmodel_group_share",
//     ...
//   } & DropboxTypes$team_log$ShmodelGroupShareType;

//   /**
//   * (showcase) Granted access to showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseAccessGranted = {
//     ".tag": "showcase_access_granted",
//     ...
//   } & DropboxTypes$team_log$ShowcaseAccessGrantedType;

//   /**
//   * (showcase) Added member to showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseAddMember = {
//     ".tag": "showcase_add_member",
//     ...
//   } & DropboxTypes$team_log$ShowcaseAddMemberType;

//   /**
//   * (showcase) Archived showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseArchived = {
//     ".tag": "showcase_archived",
//     ...
//   } & DropboxTypes$team_log$ShowcaseArchivedType;

//   /**
//   * (showcase) Created showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseCreated = {
//     ".tag": "showcase_created",
//     ...
//   } & DropboxTypes$team_log$ShowcaseCreatedType;

//   /**
//   * (showcase) Deleted showcase comment
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseDeleteComment = {
//     ".tag": "showcase_delete_comment",
//     ...
//   } & DropboxTypes$team_log$ShowcaseDeleteCommentType;

//   /**
//   * (showcase) Edited showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseEdited = {
//     ".tag": "showcase_edited",
//     ...
//   } & DropboxTypes$team_log$ShowcaseEditedType;

//   /**
//   * (showcase) Edited showcase comment
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseEditComment = {
//     ".tag": "showcase_edit_comment",
//     ...
//   } & DropboxTypes$team_log$ShowcaseEditCommentType;

//   /**
//   * (showcase) Added file to showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseFileAdded = {
//     ".tag": "showcase_file_added",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileAddedType;

//   /**
//   * (showcase) Downloaded file from showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseFileDownload = {
//     ".tag": "showcase_file_download",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileDownloadType;

//   /**
//   * (showcase) Removed file from showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseFileRemoved = {
//     ".tag": "showcase_file_removed",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileRemovedType;

//   /**
//   * (showcase) Viewed file in showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseFileView = {
//     ".tag": "showcase_file_view",
//     ...
//   } & DropboxTypes$team_log$ShowcaseFileViewType;

//   /**
//   * (showcase) Permanently deleted showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcasePermanentlyDeleted = {
//     ".tag": "showcase_permanently_deleted",
//     ...
//   } & DropboxTypes$team_log$ShowcasePermanentlyDeletedType;

//   /**
//   * (showcase) Added showcase comment
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcasePostComment = {
//     ".tag": "showcase_post_comment",
//     ...
//   } & DropboxTypes$team_log$ShowcasePostCommentType;

//   /**
//   * (showcase) Removed member from showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseRemoveMember = {
//     ".tag": "showcase_remove_member",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRemoveMemberType;

//   /**
//   * (showcase) Renamed showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseRenamed = {
//     ".tag": "showcase_renamed",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRenamedType;

//   /**
//   * (showcase) Requested access to showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseRequestAccess = {
//     ".tag": "showcase_request_access",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRequestAccessType;

//   /**
//   * (showcase) Resolved showcase comment
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseResolveComment = {
//     ".tag": "showcase_resolve_comment",
//     ...
//   } & DropboxTypes$team_log$ShowcaseResolveCommentType;

//   /**
//   * (showcase) Unarchived showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseRestored = {
//     ".tag": "showcase_restored",
//     ...
//   } & DropboxTypes$team_log$ShowcaseRestoredType;

//   /**
//   * (showcase) Deleted showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseTrashed = {
//     ".tag": "showcase_trashed",
//     ...
//   } & DropboxTypes$team_log$ShowcaseTrashedType;

//   /**
//   * (showcase) Deleted showcase (old version) (deprecated, replaced by
//   * 'Deleted showcase')
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseTrashedDeprecated = {
//     ".tag": "showcase_trashed_deprecated",
//     ...
//   } & DropboxTypes$team_log$ShowcaseTrashedDeprecatedType;

//   /**
//   * (showcase) Unresolved showcase comment
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseUnresolveComment = {
//     ".tag": "showcase_unresolve_comment",
//     ...
//   } & DropboxTypes$team_log$ShowcaseUnresolveCommentType;

//   /**
//   * (showcase) Restored showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseUntrashed = {
//     ".tag": "showcase_untrashed",
//     ...
//   } & DropboxTypes$team_log$ShowcaseUntrashedType;

//   /**
//   * (showcase) Restored showcase (old version) (deprecated, replaced by
//   * 'Restored showcase')
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseUntrashedDeprecated = {
//     ".tag": "showcase_untrashed_deprecated",
//     ...
//   } & DropboxTypes$team_log$ShowcaseUntrashedDeprecatedType;

//   /**
//   * (showcase) Viewed showcase
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseView = {
//     ".tag": "showcase_view",
//     ...
//   } & DropboxTypes$team_log$ShowcaseViewType;

//   /**
//   * (sso) Added X.509 certificate for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoAddCert = {
//     ".tag": "sso_add_cert",
//     ...
//   } & DropboxTypes$team_log$SsoAddCertType;

//   /**
//   * (sso) Added sign-in URL for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoAddLoginUrl = {
//     ".tag": "sso_add_login_url",
//     ...
//   } & DropboxTypes$team_log$SsoAddLoginUrlType;

//   /**
//   * (sso) Added sign-out URL for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoAddLogoutUrl = {
//     ".tag": "sso_add_logout_url",
//     ...
//   } & DropboxTypes$team_log$SsoAddLogoutUrlType;

//   /**
//   * (sso) Changed X.509 certificate for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoChangeCert = {
//     ".tag": "sso_change_cert",
//     ...
//   } & DropboxTypes$team_log$SsoChangeCertType;

//   /**
//   * (sso) Changed sign-in URL for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoChangeLoginUrl = {
//     ".tag": "sso_change_login_url",
//     ...
//   } & DropboxTypes$team_log$SsoChangeLoginUrlType;

//   /**
//   * (sso) Changed sign-out URL for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoChangeLogoutUrl = {
//     ".tag": "sso_change_logout_url",
//     ...
//   } & DropboxTypes$team_log$SsoChangeLogoutUrlType;

//   /**
//   * (sso) Changed SAML identity mode for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoChangeSamlIdentityMode = {
//     ".tag": "sso_change_saml_identity_mode",
//     ...
//   } & DropboxTypes$team_log$SsoChangeSamlIdentityModeType;

//   /**
//   * (sso) Removed X.509 certificate for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoRemoveCert = {
//     ".tag": "sso_remove_cert",
//     ...
//   } & DropboxTypes$team_log$SsoRemoveCertType;

//   /**
//   * (sso) Removed sign-in URL for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoRemoveLoginUrl = {
//     ".tag": "sso_remove_login_url",
//     ...
//   } & DropboxTypes$team_log$SsoRemoveLoginUrlType;

//   /**
//   * (sso) Removed sign-out URL for SSO
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoRemoveLogoutUrl = {
//     ".tag": "sso_remove_logout_url",
//     ...
//   } & DropboxTypes$team_log$SsoRemoveLogoutUrlType;

//   /**
//   * (team_folders) Changed archival status of team folder
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamFolderChangeStatus = {
//     ".tag": "team_folder_change_status",
//     ...
//   } & DropboxTypes$team_log$TeamFolderChangeStatusType;

//   /**
//   * (team_folders) Created team folder in active status
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamFolderCreate = {
//     ".tag": "team_folder_create",
//     ...
//   } & DropboxTypes$team_log$TeamFolderCreateType;

//   /**
//   * (team_folders) Downgraded team folder to regular shared folder
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamFolderDowngrade = {
//     ".tag": "team_folder_downgrade",
//     ...
//   } & DropboxTypes$team_log$TeamFolderDowngradeType;

//   /**
//   * (team_folders) Permanently deleted archived team folder
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamFolderPermanentlyDelete = {
//     ".tag": "team_folder_permanently_delete",
//     ...
//   } & DropboxTypes$team_log$TeamFolderPermanentlyDeleteType;

//   /**
//   * (team_folders) Renamed active/archived team folder
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamFolderRename = {
//     ".tag": "team_folder_rename",
//     ...
//   } & DropboxTypes$team_log$TeamFolderRenameType;

//   /**
//   * (team_folders) Changed sync default
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamSelectiveSyncSettingsChanged = {
//     ".tag": "team_selective_sync_settings_changed",
//     ...
//   } & DropboxTypes$team_log$TeamSelectiveSyncSettingsChangedType;

//   /**
//   * (team_policies) Changed account capture setting on team domain
//   */
//   declare type DropboxTypes$team_log$EventTypeAccountCaptureChangePolicy = {
//     ".tag": "account_capture_change_policy",
//     ...
//   } & DropboxTypes$team_log$AccountCaptureChangePolicyType;

//   /**
//   * (team_policies) Disabled downloads (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeAllowDownloadDisabled = {
//     ".tag": "allow_download_disabled",
//     ...
//   } & DropboxTypes$team_log$AllowDownloadDisabledType;

//   /**
//   * (team_policies) Enabled downloads (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeAllowDownloadEnabled = {
//     ".tag": "allow_download_enabled",
//     ...
//   } & DropboxTypes$team_log$AllowDownloadEnabledType;

//   /**
//   * (team_policies) Changed camera uploads setting for team
//   */
//   declare type DropboxTypes$team_log$EventTypeCameraUploadsPolicyChanged = {
//     ".tag": "camera_uploads_policy_changed",
//     ...
//   } & DropboxTypes$team_log$CameraUploadsPolicyChangedType;

//   /**
//   * (team_policies) Set restrictions on data center locations where team data
//   * resides
//   */
//   declare type DropboxTypes$team_log$EventTypeDataPlacementRestrictionChangePolicy = {
//     ".tag": "data_placement_restriction_change_policy",
//     ...
//   } & DropboxTypes$team_log$DataPlacementRestrictionChangePolicyType;

//   /**
//   * (team_policies) Completed restrictions on data center locations where
//   * team data resides
//   */
//   declare type DropboxTypes$team_log$EventTypeDataPlacementRestrictionSatisfyPolicy = {
//     ".tag": "data_placement_restriction_satisfy_policy",
//     ...
//   } & DropboxTypes$team_log$DataPlacementRestrictionSatisfyPolicyType;

//   /**
//   * (team_policies) Set/removed limit on number of computers member can link
//   * to team Dropbox account
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceApprovalsChangeDesktopPolicy = {
//     ".tag": "device_approvals_change_desktop_policy",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeDesktopPolicyType;

//   /**
//   * (team_policies) Set/removed limit on number of mobile devices member can
//   * link to team Dropbox account
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceApprovalsChangeMobilePolicy = {
//     ".tag": "device_approvals_change_mobile_policy",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeMobilePolicyType;

//   /**
//   * (team_policies) Changed device approvals setting when member is over
//   * limit
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceApprovalsChangeOverageAction = {
//     ".tag": "device_approvals_change_overage_action",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeOverageActionType;

//   /**
//   * (team_policies) Changed device approvals setting when member unlinks
//   * approved device
//   */
//   declare type DropboxTypes$team_log$EventTypeDeviceApprovalsChangeUnlinkAction = {
//     ".tag": "device_approvals_change_unlink_action",
//     ...
//   } & DropboxTypes$team_log$DeviceApprovalsChangeUnlinkActionType;

//   /**
//   * (team_policies) Added members to directory restrictions list
//   */
//   declare type DropboxTypes$team_log$EventTypeDirectoryRestrictionsAddMembers = {
//     ".tag": "directory_restrictions_add_members",
//     ...
//   } & DropboxTypes$team_log$DirectoryRestrictionsAddMembersType;

//   /**
//   * (team_policies) Removed members from directory restrictions list
//   */
//   declare type DropboxTypes$team_log$EventTypeDirectoryRestrictionsRemoveMembers = {
//     ".tag": "directory_restrictions_remove_members",
//     ...
//   } & DropboxTypes$team_log$DirectoryRestrictionsRemoveMembersType;

//   /**
//   * (team_policies) Added members to EMM exception list
//   */
//   declare type DropboxTypes$team_log$EventTypeEmmAddException = {
//     ".tag": "emm_add_exception",
//     ...
//   } & DropboxTypes$team_log$EmmAddExceptionType;

//   /**
//   * (team_policies) Enabled/disabled enterprise mobility management for
//   * members
//   */
//   declare type DropboxTypes$team_log$EventTypeEmmChangePolicy = {
//     ".tag": "emm_change_policy",
//     ...
//   } & DropboxTypes$team_log$EmmChangePolicyType;

//   /**
//   * (team_policies) Removed members from EMM exception list
//   */
//   declare type DropboxTypes$team_log$EventTypeEmmRemoveException = {
//     ".tag": "emm_remove_exception",
//     ...
//   } & DropboxTypes$team_log$EmmRemoveExceptionType;

//   /**
//   * (team_policies) Accepted/opted out of extended version history
//   */
//   declare type DropboxTypes$team_log$EventTypeExtendedVersionHistoryChangePolicy = {
//     ".tag": "extended_version_history_change_policy",
//     ...
//   } & DropboxTypes$team_log$ExtendedVersionHistoryChangePolicyType;

//   /**
//   * (team_policies) Enabled/disabled commenting on team files
//   */
//   declare type DropboxTypes$team_log$EventTypeFileCommentsChangePolicy = {
//     ".tag": "file_comments_change_policy",
//     ...
//   } & DropboxTypes$team_log$FileCommentsChangePolicyType;

//   /**
//   * (team_policies) Enabled/disabled file requests
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestsChangePolicy = {
//     ".tag": "file_requests_change_policy",
//     ...
//   } & DropboxTypes$team_log$FileRequestsChangePolicyType;

//   /**
//   * (team_policies) Enabled file request emails for everyone (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestsEmailsEnabled = {
//     ".tag": "file_requests_emails_enabled",
//     ...
//   } & DropboxTypes$team_log$FileRequestsEmailsEnabledType;

//   /**
//   * (team_policies) Enabled file request emails for team (deprecated, no
//   * longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeFileRequestsEmailsRestrictedToTeamOnly = {
//     ".tag": "file_requests_emails_restricted_to_team_only",
//     ...
//   } & DropboxTypes$team_log$FileRequestsEmailsRestrictedToTeamOnlyType;

//   /**
//   * (team_policies) Enabled/disabled Google single sign-on for team
//   */
//   declare type DropboxTypes$team_log$EventTypeGoogleSsoChangePolicy = {
//     ".tag": "google_sso_change_policy",
//     ...
//   } & DropboxTypes$team_log$GoogleSsoChangePolicyType;

//   /**
//   * (team_policies) Changed who can create groups
//   */
//   declare type DropboxTypes$team_log$EventTypeGroupUserManagementChangePolicy = {
//     ".tag": "group_user_management_change_policy",
//     ...
//   } & DropboxTypes$team_log$GroupUserManagementChangePolicyType;

//   /**
//   * (team_policies) Changed integration policy for team
//   */
//   declare type DropboxTypes$team_log$EventTypeIntegrationPolicyChanged = {
//     ".tag": "integration_policy_changed",
//     ...
//   } & DropboxTypes$team_log$IntegrationPolicyChangedType;

//   /**
//   * (team_policies) Changed whether users can find team when not invited
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberRequestsChangePolicy = {
//     ".tag": "member_requests_change_policy",
//     ...
//   } & DropboxTypes$team_log$MemberRequestsChangePolicyType;

//   /**
//   * (team_policies) Added members to member space limit exception list
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsAddException = {
//     ".tag": "member_space_limits_add_exception",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsAddExceptionType;

//   /**
//   * (team_policies) Changed member space limit type for team
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangeCapsTypePolicy = {
//     ".tag": "member_space_limits_change_caps_type_policy",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangeCapsTypePolicyType;

//   /**
//   * (team_policies) Changed team default member space limit
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangePolicy = {
//     ".tag": "member_space_limits_change_policy",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsChangePolicyType;

//   /**
//   * (team_policies) Removed members from member space limit exception list
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSpaceLimitsRemoveException = {
//     ".tag": "member_space_limits_remove_exception",
//     ...
//   } & DropboxTypes$team_log$MemberSpaceLimitsRemoveExceptionType;

//   /**
//   * (team_policies) Enabled/disabled option for team members to suggest
//   * people to add to team
//   */
//   declare type DropboxTypes$team_log$EventTypeMemberSuggestionsChangePolicy = {
//     ".tag": "member_suggestions_change_policy",
//     ...
//   } & DropboxTypes$team_log$MemberSuggestionsChangePolicyType;

//   /**
//   * (team_policies) Enabled/disabled Microsoft Office add-in
//   */
//   declare type DropboxTypes$team_log$EventTypeMicrosoftOfficeAddinChangePolicy = {
//     ".tag": "microsoft_office_addin_change_policy",
//     ...
//   } & DropboxTypes$team_log$MicrosoftOfficeAddinChangePolicyType;

//   /**
//   * (team_policies) Enabled/disabled network control
//   */
//   declare type DropboxTypes$team_log$EventTypeNetworkControlChangePolicy = {
//     ".tag": "network_control_change_policy",
//     ...
//   } & DropboxTypes$team_log$NetworkControlChangePolicyType;

//   /**
//   * (team_policies) Changed whether Dropbox Paper, when enabled, is deployed
//   * to all members or to specific members
//   */
//   declare type DropboxTypes$team_log$EventTypePaperChangeDeploymentPolicy = {
//     ".tag": "paper_change_deployment_policy",
//     ...
//   } & DropboxTypes$team_log$PaperChangeDeploymentPolicyType;

//   /**
//   * (team_policies) Changed whether non-members can view Paper docs with link
//   * (deprecated, no longer logged)
//   */
//   declare type DropboxTypes$team_log$EventTypePaperChangeMemberLinkPolicy = {
//     ".tag": "paper_change_member_link_policy",
//     ...
//   } & DropboxTypes$team_log$PaperChangeMemberLinkPolicyType;

//   /**
//   * (team_policies) Changed whether members can share Paper docs outside
//   * team, and if docs are accessible only by team members or anyone by
//   * default
//   */
//   declare type DropboxTypes$team_log$EventTypePaperChangeMemberPolicy = {
//     ".tag": "paper_change_member_policy",
//     ...
//   } & DropboxTypes$team_log$PaperChangeMemberPolicyType;

//   /**
//   * (team_policies) Enabled/disabled Dropbox Paper for team
//   */
//   declare type DropboxTypes$team_log$EventTypePaperChangePolicy = {
//     ".tag": "paper_change_policy",
//     ...
//   } & DropboxTypes$team_log$PaperChangePolicyType;

//   /**
//   * (team_policies) Changed Paper Default Folder Policy setting for team
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDefaultFolderPolicyChanged = {
//     ".tag": "paper_default_folder_policy_changed",
//     ...
//   } & DropboxTypes$team_log$PaperDefaultFolderPolicyChangedType;

//   /**
//   * (team_policies) Enabled/disabled Paper Desktop for team
//   */
//   declare type DropboxTypes$team_log$EventTypePaperDesktopPolicyChanged = {
//     ".tag": "paper_desktop_policy_changed",
//     ...
//   } & DropboxTypes$team_log$PaperDesktopPolicyChangedType;

//   /**
//   * (team_policies) Added users to Paper-enabled users list
//   */
//   declare type DropboxTypes$team_log$EventTypePaperEnabledUsersGroupAddition = {
//     ".tag": "paper_enabled_users_group_addition",
//     ...
//   } & DropboxTypes$team_log$PaperEnabledUsersGroupAdditionType;

//   /**
//   * (team_policies) Removed users from Paper-enabled users list
//   */
//   declare type DropboxTypes$team_log$EventTypePaperEnabledUsersGroupRemoval = {
//     ".tag": "paper_enabled_users_group_removal",
//     ...
//   } & DropboxTypes$team_log$PaperEnabledUsersGroupRemovalType;

//   /**
//   * (team_policies) Enabled/disabled ability of team members to permanently
//   * delete content
//   */
//   declare type DropboxTypes$team_log$EventTypePermanentDeleteChangePolicy = {
//     ".tag": "permanent_delete_change_policy",
//     ...
//   } & DropboxTypes$team_log$PermanentDeleteChangePolicyType;

//   /**
//   * (team_policies) Enabled/disabled reseller support
//   */
//   declare type DropboxTypes$team_log$EventTypeResellerSupportChangePolicy = {
//     ".tag": "reseller_support_change_policy",
//     ...
//   } & DropboxTypes$team_log$ResellerSupportChangePolicyType;

//   /**
//   * (team_policies) Changed whether team members can join shared folders
//   * owned outside team
//   */
//   declare type DropboxTypes$team_log$EventTypeSharingChangeFolderJoinPolicy = {
//     ".tag": "sharing_change_folder_join_policy",
//     ...
//   } & DropboxTypes$team_log$SharingChangeFolderJoinPolicyType;

//   /**
//   * (team_policies) Changed whether members can share links outside team, and
//   * if links are accessible only by team members or anyone by default
//   */
//   declare type DropboxTypes$team_log$EventTypeSharingChangeLinkPolicy = {
//     ".tag": "sharing_change_link_policy",
//     ...
//   } & DropboxTypes$team_log$SharingChangeLinkPolicyType;

//   /**
//   * (team_policies) Changed whether members can share files/folders outside
//   * team
//   */
//   declare type DropboxTypes$team_log$EventTypeSharingChangeMemberPolicy = {
//     ".tag": "sharing_change_member_policy",
//     ...
//   } & DropboxTypes$team_log$SharingChangeMemberPolicyType;

//   /**
//   * (team_policies) Enabled/disabled downloading files from Dropbox Showcase
//   * for team
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseChangeDownloadPolicy = {
//     ".tag": "showcase_change_download_policy",
//     ...
//   } & DropboxTypes$team_log$ShowcaseChangeDownloadPolicyType;

//   /**
//   * (team_policies) Enabled/disabled Dropbox Showcase for team
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseChangeEnabledPolicy = {
//     ".tag": "showcase_change_enabled_policy",
//     ...
//   } & DropboxTypes$team_log$ShowcaseChangeEnabledPolicyType;

//   /**
//   * (team_policies) Enabled/disabled sharing Dropbox Showcase externally for
//   * team
//   */
//   declare type DropboxTypes$team_log$EventTypeShowcaseChangeExternalSharingPolicy = {
//     ".tag": "showcase_change_external_sharing_policy",
//     ...
//   } & DropboxTypes$team_log$ShowcaseChangeExternalSharingPolicyType;

//   /**
//   * (team_policies) Changed default Smart Sync setting for team members
//   */
//   declare type DropboxTypes$team_log$EventTypeSmartSyncChangePolicy = {
//     ".tag": "smart_sync_change_policy",
//     ...
//   } & DropboxTypes$team_log$SmartSyncChangePolicyType;

//   /**
//   * (team_policies) Opted team into Smart Sync
//   */
//   declare type DropboxTypes$team_log$EventTypeSmartSyncNotOptOut = {
//     ".tag": "smart_sync_not_opt_out",
//     ...
//   } & DropboxTypes$team_log$SmartSyncNotOptOutType;

//   /**
//   * (team_policies) Opted team out of Smart Sync
//   */
//   declare type DropboxTypes$team_log$EventTypeSmartSyncOptOut = {
//     ".tag": "smart_sync_opt_out",
//     ...
//   } & DropboxTypes$team_log$SmartSyncOptOutType;

//   /**
//   * (team_policies) Changed single sign-on setting for team
//   */
//   declare type DropboxTypes$team_log$EventTypeSsoChangePolicy = {
//     ".tag": "sso_change_policy",
//     ...
//   } & DropboxTypes$team_log$SsoChangePolicyType;

//   /**
//   * (team_policies) Changed App Integrations setting for team
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamExtensionsPolicyChanged = {
//     ".tag": "team_extensions_policy_changed",
//     ...
//   } & DropboxTypes$team_log$TeamExtensionsPolicyChangedType;

//   /**
//   * (team_policies) Enabled/disabled Team Selective Sync for team
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamSelectiveSyncPolicyChanged = {
//     ".tag": "team_selective_sync_policy_changed",
//     ...
//   } & DropboxTypes$team_log$TeamSelectiveSyncPolicyChangedType;

//   /**
//   * (team_policies) Changed two-step verification setting for team
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaChangePolicy = {
//     ".tag": "tfa_change_policy",
//     ...
//   } & DropboxTypes$team_log$TfaChangePolicyType;

//   /**
//   * (team_policies) Enabled/disabled option for members to link personal
//   * Dropbox account and team account to same computer
//   */
//   declare type DropboxTypes$team_log$EventTypeTwoAccountChangePolicy = {
//     ".tag": "two_account_change_policy",
//     ...
//   } & DropboxTypes$team_log$TwoAccountChangePolicyType;

//   /**
//   * (team_policies) Changed team policy for viewer info
//   */
//   declare type DropboxTypes$team_log$EventTypeViewerInfoPolicyChanged = {
//     ".tag": "viewer_info_policy_changed",
//     ...
//   } & DropboxTypes$team_log$ViewerInfoPolicyChangedType;

//   /**
//   * (team_policies) Changed how long members can stay signed in to
//   * Dropbox.com
//   */
//   declare type DropboxTypes$team_log$EventTypeWebSessionsChangeFixedLengthPolicy = {
//     ".tag": "web_sessions_change_fixed_length_policy",
//     ...
//   } & DropboxTypes$team_log$WebSessionsChangeFixedLengthPolicyType;

//   /**
//   * (team_policies) Changed how long team members can be idle while signed in
//   * to Dropbox.com
//   */
//   declare type DropboxTypes$team_log$EventTypeWebSessionsChangeIdleLengthPolicy = {
//     ".tag": "web_sessions_change_idle_length_policy",
//     ...
//   } & DropboxTypes$team_log$WebSessionsChangeIdleLengthPolicyType;

//   /**
//   * (team_profile) Merged another team into this team
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeFrom = {
//     ".tag": "team_merge_from",
//     ...
//   } & DropboxTypes$team_log$TeamMergeFromType;

//   /**
//   * (team_profile) Merged this team into another team
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeTo = {
//     ".tag": "team_merge_to",
//     ...
//   } & DropboxTypes$team_log$TeamMergeToType;

//   /**
//   * (team_profile) Added team logo to display on shared link headers
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamProfileAddLogo = {
//     ".tag": "team_profile_add_logo",
//     ...
//   } & DropboxTypes$team_log$TeamProfileAddLogoType;

//   /**
//   * (team_profile) Changed default language for team
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamProfileChangeDefaultLanguage = {
//     ".tag": "team_profile_change_default_language",
//     ...
//   } & DropboxTypes$team_log$TeamProfileChangeDefaultLanguageType;

//   /**
//   * (team_profile) Changed team logo displayed on shared link headers
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamProfileChangeLogo = {
//     ".tag": "team_profile_change_logo",
//     ...
//   } & DropboxTypes$team_log$TeamProfileChangeLogoType;

//   /**
//   * (team_profile) Changed team name
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamProfileChangeName = {
//     ".tag": "team_profile_change_name",
//     ...
//   } & DropboxTypes$team_log$TeamProfileChangeNameType;

//   /**
//   * (team_profile) Removed team logo displayed on shared link headers
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamProfileRemoveLogo = {
//     ".tag": "team_profile_remove_logo",
//     ...
//   } & DropboxTypes$team_log$TeamProfileRemoveLogoType;

//   /**
//   * (tfa) Added backup phone for two-step verification
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaAddBackupPhone = {
//     ".tag": "tfa_add_backup_phone",
//     ...
//   } & DropboxTypes$team_log$TfaAddBackupPhoneType;

//   /**
//   * (tfa) Added security key for two-step verification
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaAddSecurityKey = {
//     ".tag": "tfa_add_security_key",
//     ...
//   } & DropboxTypes$team_log$TfaAddSecurityKeyType;

//   /**
//   * (tfa) Changed backup phone for two-step verification
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaChangeBackupPhone = {
//     ".tag": "tfa_change_backup_phone",
//     ...
//   } & DropboxTypes$team_log$TfaChangeBackupPhoneType;

//   /**
//   * (tfa) Enabled/disabled/changed two-step verification setting
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaChangeStatus = {
//     ".tag": "tfa_change_status",
//     ...
//   } & DropboxTypes$team_log$TfaChangeStatusType;

//   /**
//   * (tfa) Removed backup phone for two-step verification
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaRemoveBackupPhone = {
//     ".tag": "tfa_remove_backup_phone",
//     ...
//   } & DropboxTypes$team_log$TfaRemoveBackupPhoneType;

//   /**
//   * (tfa) Removed security key for two-step verification
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaRemoveSecurityKey = {
//     ".tag": "tfa_remove_security_key",
//     ...
//   } & DropboxTypes$team_log$TfaRemoveSecurityKeyType;

//   /**
//   * (tfa) Reset two-step verification for team member
//   */
//   declare type DropboxTypes$team_log$EventTypeTfaReset = {
//     ".tag": "tfa_reset",
//     ...
//   } & DropboxTypes$team_log$TfaResetType;

//   /**
//   * (trusted_teams) Changed guest team admin status
//   */
//   declare type DropboxTypes$team_log$EventTypeGuestAdminChangeStatus = {
//     ".tag": "guest_admin_change_status",
//     ...
//   } & DropboxTypes$team_log$GuestAdminChangeStatusType;

//   /**
//   * (trusted_teams) Accepted a team merge request
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestAccepted = {
//     ".tag": "team_merge_request_accepted",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAcceptedType;

//   /**
//   * (trusted_teams) Accepted a team merge request (deprecated, replaced by
//   * 'Accepted a team merge request')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestAcceptedShownToPrimaryTeam = {
//     ".tag": "team_merge_request_accepted_shown_to_primary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAcceptedShownToPrimaryTeamType;

//   /**
//   * (trusted_teams) Accepted a team merge request (deprecated, replaced by
//   * 'Accepted a team merge request')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestAcceptedShownToSecondaryTeam = {
//     ".tag": "team_merge_request_accepted_shown_to_secondary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAcceptedShownToSecondaryTeamType;

//   /**
//   * (trusted_teams) Automatically canceled team merge request
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestAutoCanceled = {
//     ".tag": "team_merge_request_auto_canceled",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestAutoCanceledType;

//   /**
//   * (trusted_teams) Canceled a team merge request
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestCanceled = {
//     ".tag": "team_merge_request_canceled",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestCanceledType;

//   /**
//   * (trusted_teams) Canceled a team merge request (deprecated, replaced by
//   * 'Canceled a team merge request')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestCanceledShownToPrimaryTeam = {
//     ".tag": "team_merge_request_canceled_shown_to_primary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestCanceledShownToPrimaryTeamType;

//   /**
//   * (trusted_teams) Canceled a team merge request (deprecated, replaced by
//   * 'Canceled a team merge request')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestCanceledShownToSecondaryTeam = {
//     ".tag": "team_merge_request_canceled_shown_to_secondary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestCanceledShownToSecondaryTeamType;

//   /**
//   * (trusted_teams) Team merge request expired
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestExpired = {
//     ".tag": "team_merge_request_expired",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestExpiredType;

//   /**
//   * (trusted_teams) Team merge request expired (deprecated, replaced by 'Team
//   * merge request expired')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestExpiredShownToPrimaryTeam = {
//     ".tag": "team_merge_request_expired_shown_to_primary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestExpiredShownToPrimaryTeamType;

//   /**
//   * (trusted_teams) Team merge request expired (deprecated, replaced by 'Team
//   * merge request expired')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestExpiredShownToSecondaryTeam = {
//     ".tag": "team_merge_request_expired_shown_to_secondary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestExpiredShownToSecondaryTeamType;

//   /**
//   * (trusted_teams) Rejected a team merge request (deprecated, no longer
//   * logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestRejectedShownToPrimaryTeam = {
//     ".tag": "team_merge_request_rejected_shown_to_primary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestRejectedShownToPrimaryTeamType;

//   /**
//   * (trusted_teams) Rejected a team merge request (deprecated, no longer
//   * logged)
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestRejectedShownToSecondaryTeam = {
//     ".tag": "team_merge_request_rejected_shown_to_secondary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestRejectedShownToSecondaryTeamType;

//   /**
//   * (trusted_teams) Sent a team merge request reminder
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestReminder = {
//     ".tag": "team_merge_request_reminder",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestReminderType;

//   /**
//   * (trusted_teams) Sent a team merge request reminder (deprecated, replaced
//   * by 'Sent a team merge request reminder')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestReminderShownToPrimaryTeam = {
//     ".tag": "team_merge_request_reminder_shown_to_primary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestReminderShownToPrimaryTeamType;

//   /**
//   * (trusted_teams) Sent a team merge request reminder (deprecated, replaced
//   * by 'Sent a team merge request reminder')
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestReminderShownToSecondaryTeam = {
//     ".tag": "team_merge_request_reminder_shown_to_secondary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestReminderShownToSecondaryTeamType;

//   /**
//   * (trusted_teams) Canceled the team merge
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestRevoked = {
//     ".tag": "team_merge_request_revoked",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestRevokedType;

//   /**
//   * (trusted_teams) Requested to merge their Dropbox team into yours
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestSentShownToPrimaryTeam = {
//     ".tag": "team_merge_request_sent_shown_to_primary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestSentShownToPrimaryTeamType;

//   /**
//   * (trusted_teams) Requested to merge your team into another Dropbox team
//   */
//   declare type DropboxTypes$team_log$EventTypeTeamMergeRequestSentShownToSecondaryTeam = {
//     ".tag": "team_merge_request_sent_shown_to_secondary_team",
//     ...
//   } & DropboxTypes$team_log$TeamMergeRequestSentShownToSecondaryTeamType;

//   declare interface DropboxTypes$team_log$EventTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * The type of the event.
//   */
//   declare type DropboxTypes$team_log$EventType =
//     | DropboxTypes$team_log$EventTypeAppLinkTeam
//     | DropboxTypes$team_log$EventTypeAppLinkUser
//     | DropboxTypes$team_log$EventTypeAppUnlinkTeam
//     | DropboxTypes$team_log$EventTypeAppUnlinkUser
//     | DropboxTypes$team_log$EventTypeIntegrationConnected
//     | DropboxTypes$team_log$EventTypeIntegrationDisconnected
//     | DropboxTypes$team_log$EventTypeFileAddComment
//     | DropboxTypes$team_log$EventTypeFileChangeCommentSubscription
//     | DropboxTypes$team_log$EventTypeFileDeleteComment
//     | DropboxTypes$team_log$EventTypeFileEditComment
//     | DropboxTypes$team_log$EventTypeFileLikeComment
//     | DropboxTypes$team_log$EventTypeFileResolveComment
//     | DropboxTypes$team_log$EventTypeFileUnlikeComment
//     | DropboxTypes$team_log$EventTypeFileUnresolveComment
//     | DropboxTypes$team_log$EventTypeDeviceChangeIpDesktop
//     | DropboxTypes$team_log$EventTypeDeviceChangeIpMobile
//     | DropboxTypes$team_log$EventTypeDeviceChangeIpWeb
//     | DropboxTypes$team_log$EventTypeDeviceDeleteOnUnlinkFail
//     | DropboxTypes$team_log$EventTypeDeviceDeleteOnUnlinkSuccess
//     | DropboxTypes$team_log$EventTypeDeviceLinkFail
//     | DropboxTypes$team_log$EventTypeDeviceLinkSuccess
//     | DropboxTypes$team_log$EventTypeDeviceManagementDisabled
//     | DropboxTypes$team_log$EventTypeDeviceManagementEnabled
//     | DropboxTypes$team_log$EventTypeDeviceUnlink
//     | DropboxTypes$team_log$EventTypeEmmRefreshAuthToken
//     | DropboxTypes$team_log$EventTypeAccountCaptureChangeAvailability
//     | DropboxTypes$team_log$EventTypeAccountCaptureMigrateAccount
//     | DropboxTypes$team_log$EventTypeAccountCaptureNotificationEmailsSent
//     | DropboxTypes$team_log$EventTypeAccountCaptureRelinquishAccount
//     | DropboxTypes$team_log$EventTypeDisabledDomainInvites
//     | DropboxTypes$team_log$EventTypeDomainInvitesApproveRequestToJoinTeam
//     | DropboxTypes$team_log$EventTypeDomainInvitesDeclineRequestToJoinTeam
//     | DropboxTypes$team_log$EventTypeDomainInvitesEmailExistingUsers
//     | DropboxTypes$team_log$EventTypeDomainInvitesRequestToJoinTeam
//     | DropboxTypes$team_log$EventTypeDomainInvitesSetInviteNewUserPrefToNo
//     | DropboxTypes$team_log$EventTypeDomainInvitesSetInviteNewUserPrefToYes
//     | DropboxTypes$team_log$EventTypeDomainVerificationAddDomainFail
//     | DropboxTypes$team_log$EventTypeDomainVerificationAddDomainSuccess
//     | DropboxTypes$team_log$EventTypeDomainVerificationRemoveDomain
//     | DropboxTypes$team_log$EventTypeEnabledDomainInvites
//     | DropboxTypes$team_log$EventTypeCreateFolder
//     | DropboxTypes$team_log$EventTypeFileAdd
//     | DropboxTypes$team_log$EventTypeFileCopy
//     | DropboxTypes$team_log$EventTypeFileDelete
//     | DropboxTypes$team_log$EventTypeFileDownload
//     | DropboxTypes$team_log$EventTypeFileEdit
//     | DropboxTypes$team_log$EventTypeFileGetCopyReference
//     | DropboxTypes$team_log$EventTypeFileMove
//     | DropboxTypes$team_log$EventTypeFilePermanentlyDelete
//     | DropboxTypes$team_log$EventTypeFilePreview
//     | DropboxTypes$team_log$EventTypeFileRename
//     | DropboxTypes$team_log$EventTypeFileRestore
//     | DropboxTypes$team_log$EventTypeFileRevert
//     | DropboxTypes$team_log$EventTypeFileRollbackChanges
//     | DropboxTypes$team_log$EventTypeFileSaveCopyReference
//     | DropboxTypes$team_log$EventTypeFileRequestChange
//     | DropboxTypes$team_log$EventTypeFileRequestClose
//     | DropboxTypes$team_log$EventTypeFileRequestCreate
//     | DropboxTypes$team_log$EventTypeFileRequestDelete
//     | DropboxTypes$team_log$EventTypeFileRequestReceiveFile
//     | DropboxTypes$team_log$EventTypeGroupAddExternalId
//     | DropboxTypes$team_log$EventTypeGroupAddMember
//     | DropboxTypes$team_log$EventTypeGroupChangeExternalId
//     | DropboxTypes$team_log$EventTypeGroupChangeManagementType
//     | DropboxTypes$team_log$EventTypeGroupChangeMemberRole
//     | DropboxTypes$team_log$EventTypeGroupCreate
//     | DropboxTypes$team_log$EventTypeGroupDelete
//     | DropboxTypes$team_log$EventTypeGroupDescriptionUpdated
//     | DropboxTypes$team_log$EventTypeGroupJoinPolicyUpdated
//     | DropboxTypes$team_log$EventTypeGroupMoved
//     | DropboxTypes$team_log$EventTypeGroupRemoveExternalId
//     | DropboxTypes$team_log$EventTypeGroupRemoveMember
//     | DropboxTypes$team_log$EventTypeGroupRename
//     | DropboxTypes$team_log$EventTypeEmmError
//     | DropboxTypes$team_log$EventTypeGuestAdminSignedInViaTrustedTeams
//     | DropboxTypes$team_log$EventTypeGuestAdminSignedOutViaTrustedTeams
//     | DropboxTypes$team_log$EventTypeLoginFail
//     | DropboxTypes$team_log$EventTypeLoginSuccess
//     | DropboxTypes$team_log$EventTypeLogout
//     | DropboxTypes$team_log$EventTypeResellerSupportSessionEnd
//     | DropboxTypes$team_log$EventTypeResellerSupportSessionStart
//     | DropboxTypes$team_log$EventTypeSignInAsSessionEnd
//     | DropboxTypes$team_log$EventTypeSignInAsSessionStart
//     | DropboxTypes$team_log$EventTypeSsoError
//     | DropboxTypes$team_log$EventTypeMemberAddExternalId
//     | DropboxTypes$team_log$EventTypeMemberAddName
//     | DropboxTypes$team_log$EventTypeMemberChangeAdminRole
//     | DropboxTypes$team_log$EventTypeMemberChangeEmail
//     | DropboxTypes$team_log$EventTypeMemberChangeExternalId
//     | DropboxTypes$team_log$EventTypeMemberChangeMembershipType
//     | DropboxTypes$team_log$EventTypeMemberChangeName
//     | DropboxTypes$team_log$EventTypeMemberChangeStatus
//     | DropboxTypes$team_log$EventTypeMemberDeleteManualContacts
//     | DropboxTypes$team_log$EventTypeMemberPermanentlyDeleteAccountContents
//     | DropboxTypes$team_log$EventTypeMemberRemoveExternalId
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsAddCustomQuota
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangeCustomQuota
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangeStatus
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsRemoveCustomQuota
//     | DropboxTypes$team_log$EventTypeMemberSuggest
//     | DropboxTypes$team_log$EventTypeMemberTransferAccountContents
//     | DropboxTypes$team_log$EventTypeSecondaryMailsPolicyChanged
//     | DropboxTypes$team_log$EventTypePaperContentAddMember
//     | DropboxTypes$team_log$EventTypePaperContentAddToFolder
//     | DropboxTypes$team_log$EventTypePaperContentArchive
//     | DropboxTypes$team_log$EventTypePaperContentCreate
//     | DropboxTypes$team_log$EventTypePaperContentPermanentlyDelete
//     | DropboxTypes$team_log$EventTypePaperContentRemoveFromFolder
//     | DropboxTypes$team_log$EventTypePaperContentRemoveMember
//     | DropboxTypes$team_log$EventTypePaperContentRename
//     | DropboxTypes$team_log$EventTypePaperContentRestore
//     | DropboxTypes$team_log$EventTypePaperDocAddComment
//     | DropboxTypes$team_log$EventTypePaperDocChangeMemberRole
//     | DropboxTypes$team_log$EventTypePaperDocChangeSharingPolicy
//     | DropboxTypes$team_log$EventTypePaperDocChangeSubscription
//     | DropboxTypes$team_log$EventTypePaperDocDeleted
//     | DropboxTypes$team_log$EventTypePaperDocDeleteComment
//     | DropboxTypes$team_log$EventTypePaperDocDownload
//     | DropboxTypes$team_log$EventTypePaperDocEdit
//     | DropboxTypes$team_log$EventTypePaperDocEditComment
//     | DropboxTypes$team_log$EventTypePaperDocFollowed
//     | DropboxTypes$team_log$EventTypePaperDocMention
//     | DropboxTypes$team_log$EventTypePaperDocOwnershipChanged
//     | DropboxTypes$team_log$EventTypePaperDocRequestAccess
//     | DropboxTypes$team_log$EventTypePaperDocResolveComment
//     | DropboxTypes$team_log$EventTypePaperDocRevert
//     | DropboxTypes$team_log$EventTypePaperDocSlackShare
//     | DropboxTypes$team_log$EventTypePaperDocTeamInvite
//     | DropboxTypes$team_log$EventTypePaperDocTrashed
//     | DropboxTypes$team_log$EventTypePaperDocUnresolveComment
//     | DropboxTypes$team_log$EventTypePaperDocUntrashed
//     | DropboxTypes$team_log$EventTypePaperDocView
//     | DropboxTypes$team_log$EventTypePaperExternalViewAllow
//     | DropboxTypes$team_log$EventTypePaperExternalViewDefaultTeam
//     | DropboxTypes$team_log$EventTypePaperExternalViewForbid
//     | DropboxTypes$team_log$EventTypePaperFolderChangeSubscription
//     | DropboxTypes$team_log$EventTypePaperFolderDeleted
//     | DropboxTypes$team_log$EventTypePaperFolderFollowed
//     | DropboxTypes$team_log$EventTypePaperFolderTeamInvite
//     | DropboxTypes$team_log$EventTypePaperPublishedLinkCreate
//     | DropboxTypes$team_log$EventTypePaperPublishedLinkDisabled
//     | DropboxTypes$team_log$EventTypePaperPublishedLinkView
//     | DropboxTypes$team_log$EventTypePasswordChange
//     | DropboxTypes$team_log$EventTypePasswordReset
//     | DropboxTypes$team_log$EventTypePasswordResetAll
//     | DropboxTypes$team_log$EventTypeEmmCreateExceptionsReport
//     | DropboxTypes$team_log$EventTypeEmmCreateUsageReport
//     | DropboxTypes$team_log$EventTypeExportMembersReport
//     | DropboxTypes$team_log$EventTypePaperAdminExportStart
//     | DropboxTypes$team_log$EventTypeSmartSyncCreateAdminPrivilegeReport
//     | DropboxTypes$team_log$EventTypeTeamActivityCreateReport
//     | DropboxTypes$team_log$EventTypeTeamActivityCreateReportFail
//     | DropboxTypes$team_log$EventTypeCollectionShare
//     | DropboxTypes$team_log$EventTypeNoteAclInviteOnly
//     | DropboxTypes$team_log$EventTypeNoteAclLink
//     | DropboxTypes$team_log$EventTypeNoteAclTeamLink
//     | DropboxTypes$team_log$EventTypeNoteShared
//     | DropboxTypes$team_log$EventTypeNoteShareReceive
//     | DropboxTypes$team_log$EventTypeOpenNoteShared
//     | DropboxTypes$team_log$EventTypeSfAddGroup
//     | DropboxTypes$team_log$EventTypeSfAllowNonMembersToViewSharedLinks
//     | DropboxTypes$team_log$EventTypeSfExternalInviteWarn
//     | DropboxTypes$team_log$EventTypeSfFbInvite
//     | DropboxTypes$team_log$EventTypeSfFbInviteChangeRole
//     | DropboxTypes$team_log$EventTypeSfFbUninvite
//     | DropboxTypes$team_log$EventTypeSfInviteGroup
//     | DropboxTypes$team_log$EventTypeSfTeamGrantAccess
//     | DropboxTypes$team_log$EventTypeSfTeamInvite
//     | DropboxTypes$team_log$EventTypeSfTeamInviteChangeRole
//     | DropboxTypes$team_log$EventTypeSfTeamJoin
//     | DropboxTypes$team_log$EventTypeSfTeamJoinFromOobLink
//     | DropboxTypes$team_log$EventTypeSfTeamUninvite
//     | DropboxTypes$team_log$EventTypeSharedContentAddInvitees
//     | DropboxTypes$team_log$EventTypeSharedContentAddLinkExpiry
//     | DropboxTypes$team_log$EventTypeSharedContentAddLinkPassword
//     | DropboxTypes$team_log$EventTypeSharedContentAddMember
//     | DropboxTypes$team_log$EventTypeSharedContentChangeDownloadsPolicy
//     | DropboxTypes$team_log$EventTypeSharedContentChangeInviteeRole
//     | DropboxTypes$team_log$EventTypeSharedContentChangeLinkAudience
//     | DropboxTypes$team_log$EventTypeSharedContentChangeLinkExpiry
//     | DropboxTypes$team_log$EventTypeSharedContentChangeLinkPassword
//     | DropboxTypes$team_log$EventTypeSharedContentChangeMemberRole
//     | DropboxTypes$team_log$EventTypeSharedContentChangeViewerInfoPolicy
//     | DropboxTypes$team_log$EventTypeSharedContentClaimInvitation
//     | DropboxTypes$team_log$EventTypeSharedContentCopy
//     | DropboxTypes$team_log$EventTypeSharedContentDownload
//     | DropboxTypes$team_log$EventTypeSharedContentRelinquishMembership
//     | DropboxTypes$team_log$EventTypeSharedContentRemoveInvitees
//     | DropboxTypes$team_log$EventTypeSharedContentRemoveLinkExpiry
//     | DropboxTypes$team_log$EventTypeSharedContentRemoveLinkPassword
//     | DropboxTypes$team_log$EventTypeSharedContentRemoveMember
//     | DropboxTypes$team_log$EventTypeSharedContentRequestAccess
//     | DropboxTypes$team_log$EventTypeSharedContentUnshare
//     | DropboxTypes$team_log$EventTypeSharedContentView
//     | DropboxTypes$team_log$EventTypeSharedFolderChangeLinkPolicy
//     | DropboxTypes$team_log$EventTypeSharedFolderChangeMembersInheritancePolicy
//     | DropboxTypes$team_log$EventTypeSharedFolderChangeMembersManagementPolicy
//     | DropboxTypes$team_log$EventTypeSharedFolderChangeMembersPolicy
//     | DropboxTypes$team_log$EventTypeSharedFolderCreate
//     | DropboxTypes$team_log$EventTypeSharedFolderDeclineInvitation
//     | DropboxTypes$team_log$EventTypeSharedFolderMount
//     | DropboxTypes$team_log$EventTypeSharedFolderNest
//     | DropboxTypes$team_log$EventTypeSharedFolderTransferOwnership
//     | DropboxTypes$team_log$EventTypeSharedFolderUnmount
//     | DropboxTypes$team_log$EventTypeSharedLinkAddExpiry
//     | DropboxTypes$team_log$EventTypeSharedLinkChangeExpiry
//     | DropboxTypes$team_log$EventTypeSharedLinkChangeVisibility
//     | DropboxTypes$team_log$EventTypeSharedLinkCopy
//     | DropboxTypes$team_log$EventTypeSharedLinkCreate
//     | DropboxTypes$team_log$EventTypeSharedLinkDisable
//     | DropboxTypes$team_log$EventTypeSharedLinkDownload
//     | DropboxTypes$team_log$EventTypeSharedLinkRemoveExpiry
//     | DropboxTypes$team_log$EventTypeSharedLinkShare
//     | DropboxTypes$team_log$EventTypeSharedLinkView
//     | DropboxTypes$team_log$EventTypeSharedNoteOpened
//     | DropboxTypes$team_log$EventTypeShmodelGroupShare
//     | DropboxTypes$team_log$EventTypeShowcaseAccessGranted
//     | DropboxTypes$team_log$EventTypeShowcaseAddMember
//     | DropboxTypes$team_log$EventTypeShowcaseArchived
//     | DropboxTypes$team_log$EventTypeShowcaseCreated
//     | DropboxTypes$team_log$EventTypeShowcaseDeleteComment
//     | DropboxTypes$team_log$EventTypeShowcaseEdited
//     | DropboxTypes$team_log$EventTypeShowcaseEditComment
//     | DropboxTypes$team_log$EventTypeShowcaseFileAdded
//     | DropboxTypes$team_log$EventTypeShowcaseFileDownload
//     | DropboxTypes$team_log$EventTypeShowcaseFileRemoved
//     | DropboxTypes$team_log$EventTypeShowcaseFileView
//     | DropboxTypes$team_log$EventTypeShowcasePermanentlyDeleted
//     | DropboxTypes$team_log$EventTypeShowcasePostComment
//     | DropboxTypes$team_log$EventTypeShowcaseRemoveMember
//     | DropboxTypes$team_log$EventTypeShowcaseRenamed
//     | DropboxTypes$team_log$EventTypeShowcaseRequestAccess
//     | DropboxTypes$team_log$EventTypeShowcaseResolveComment
//     | DropboxTypes$team_log$EventTypeShowcaseRestored
//     | DropboxTypes$team_log$EventTypeShowcaseTrashed
//     | DropboxTypes$team_log$EventTypeShowcaseTrashedDeprecated
//     | DropboxTypes$team_log$EventTypeShowcaseUnresolveComment
//     | DropboxTypes$team_log$EventTypeShowcaseUntrashed
//     | DropboxTypes$team_log$EventTypeShowcaseUntrashedDeprecated
//     | DropboxTypes$team_log$EventTypeShowcaseView
//     | DropboxTypes$team_log$EventTypeSsoAddCert
//     | DropboxTypes$team_log$EventTypeSsoAddLoginUrl
//     | DropboxTypes$team_log$EventTypeSsoAddLogoutUrl
//     | DropboxTypes$team_log$EventTypeSsoChangeCert
//     | DropboxTypes$team_log$EventTypeSsoChangeLoginUrl
//     | DropboxTypes$team_log$EventTypeSsoChangeLogoutUrl
//     | DropboxTypes$team_log$EventTypeSsoChangeSamlIdentityMode
//     | DropboxTypes$team_log$EventTypeSsoRemoveCert
//     | DropboxTypes$team_log$EventTypeSsoRemoveLoginUrl
//     | DropboxTypes$team_log$EventTypeSsoRemoveLogoutUrl
//     | DropboxTypes$team_log$EventTypeTeamFolderChangeStatus
//     | DropboxTypes$team_log$EventTypeTeamFolderCreate
//     | DropboxTypes$team_log$EventTypeTeamFolderDowngrade
//     | DropboxTypes$team_log$EventTypeTeamFolderPermanentlyDelete
//     | DropboxTypes$team_log$EventTypeTeamFolderRename
//     | DropboxTypes$team_log$EventTypeTeamSelectiveSyncSettingsChanged
//     | DropboxTypes$team_log$EventTypeAccountCaptureChangePolicy
//     | DropboxTypes$team_log$EventTypeAllowDownloadDisabled
//     | DropboxTypes$team_log$EventTypeAllowDownloadEnabled
//     | DropboxTypes$team_log$EventTypeCameraUploadsPolicyChanged
//     | DropboxTypes$team_log$EventTypeDataPlacementRestrictionChangePolicy
//     | DropboxTypes$team_log$EventTypeDataPlacementRestrictionSatisfyPolicy
//     | DropboxTypes$team_log$EventTypeDeviceApprovalsChangeDesktopPolicy
//     | DropboxTypes$team_log$EventTypeDeviceApprovalsChangeMobilePolicy
//     | DropboxTypes$team_log$EventTypeDeviceApprovalsChangeOverageAction
//     | DropboxTypes$team_log$EventTypeDeviceApprovalsChangeUnlinkAction
//     | DropboxTypes$team_log$EventTypeDirectoryRestrictionsAddMembers
//     | DropboxTypes$team_log$EventTypeDirectoryRestrictionsRemoveMembers
//     | DropboxTypes$team_log$EventTypeEmmAddException
//     | DropboxTypes$team_log$EventTypeEmmChangePolicy
//     | DropboxTypes$team_log$EventTypeEmmRemoveException
//     | DropboxTypes$team_log$EventTypeExtendedVersionHistoryChangePolicy
//     | DropboxTypes$team_log$EventTypeFileCommentsChangePolicy
//     | DropboxTypes$team_log$EventTypeFileRequestsChangePolicy
//     | DropboxTypes$team_log$EventTypeFileRequestsEmailsEnabled
//     | DropboxTypes$team_log$EventTypeFileRequestsEmailsRestrictedToTeamOnly
//     | DropboxTypes$team_log$EventTypeGoogleSsoChangePolicy
//     | DropboxTypes$team_log$EventTypeGroupUserManagementChangePolicy
//     | DropboxTypes$team_log$EventTypeIntegrationPolicyChanged
//     | DropboxTypes$team_log$EventTypeMemberRequestsChangePolicy
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsAddException
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangeCapsTypePolicy
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsChangePolicy
//     | DropboxTypes$team_log$EventTypeMemberSpaceLimitsRemoveException
//     | DropboxTypes$team_log$EventTypeMemberSuggestionsChangePolicy
//     | DropboxTypes$team_log$EventTypeMicrosoftOfficeAddinChangePolicy
//     | DropboxTypes$team_log$EventTypeNetworkControlChangePolicy
//     | DropboxTypes$team_log$EventTypePaperChangeDeploymentPolicy
//     | DropboxTypes$team_log$EventTypePaperChangeMemberLinkPolicy
//     | DropboxTypes$team_log$EventTypePaperChangeMemberPolicy
//     | DropboxTypes$team_log$EventTypePaperChangePolicy
//     | DropboxTypes$team_log$EventTypePaperDefaultFolderPolicyChanged
//     | DropboxTypes$team_log$EventTypePaperDesktopPolicyChanged
//     | DropboxTypes$team_log$EventTypePaperEnabledUsersGroupAddition
//     | DropboxTypes$team_log$EventTypePaperEnabledUsersGroupRemoval
//     | DropboxTypes$team_log$EventTypePermanentDeleteChangePolicy
//     | DropboxTypes$team_log$EventTypeResellerSupportChangePolicy
//     | DropboxTypes$team_log$EventTypeSharingChangeFolderJoinPolicy
//     | DropboxTypes$team_log$EventTypeSharingChangeLinkPolicy
//     | DropboxTypes$team_log$EventTypeSharingChangeMemberPolicy
//     | DropboxTypes$team_log$EventTypeShowcaseChangeDownloadPolicy
//     | DropboxTypes$team_log$EventTypeShowcaseChangeEnabledPolicy
//     | DropboxTypes$team_log$EventTypeShowcaseChangeExternalSharingPolicy
//     | DropboxTypes$team_log$EventTypeSmartSyncChangePolicy
//     | DropboxTypes$team_log$EventTypeSmartSyncNotOptOut
//     | DropboxTypes$team_log$EventTypeSmartSyncOptOut
//     | DropboxTypes$team_log$EventTypeSsoChangePolicy
//     | DropboxTypes$team_log$EventTypeTeamExtensionsPolicyChanged
//     | DropboxTypes$team_log$EventTypeTeamSelectiveSyncPolicyChanged
//     | DropboxTypes$team_log$EventTypeTfaChangePolicy
//     | DropboxTypes$team_log$EventTypeTwoAccountChangePolicy
//     | DropboxTypes$team_log$EventTypeViewerInfoPolicyChanged
//     | DropboxTypes$team_log$EventTypeWebSessionsChangeFixedLengthPolicy
//     | DropboxTypes$team_log$EventTypeWebSessionsChangeIdleLengthPolicy
//     | DropboxTypes$team_log$EventTypeTeamMergeFrom
//     | DropboxTypes$team_log$EventTypeTeamMergeTo
//     | DropboxTypes$team_log$EventTypeTeamProfileAddLogo
//     | DropboxTypes$team_log$EventTypeTeamProfileChangeDefaultLanguage
//     | DropboxTypes$team_log$EventTypeTeamProfileChangeLogo
//     | DropboxTypes$team_log$EventTypeTeamProfileChangeName
//     | DropboxTypes$team_log$EventTypeTeamProfileRemoveLogo
//     | DropboxTypes$team_log$EventTypeTfaAddBackupPhone
//     | DropboxTypes$team_log$EventTypeTfaAddSecurityKey
//     | DropboxTypes$team_log$EventTypeTfaChangeBackupPhone
//     | DropboxTypes$team_log$EventTypeTfaChangeStatus
//     | DropboxTypes$team_log$EventTypeTfaRemoveBackupPhone
//     | DropboxTypes$team_log$EventTypeTfaRemoveSecurityKey
//     | DropboxTypes$team_log$EventTypeTfaReset
//     | DropboxTypes$team_log$EventTypeGuestAdminChangeStatus
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestAccepted
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestAcceptedShownToPrimaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestAcceptedShownToSecondaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestAutoCanceled
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestCanceled
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestCanceledShownToPrimaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestCanceledShownToSecondaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestExpired
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestExpiredShownToPrimaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestExpiredShownToSecondaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestRejectedShownToPrimaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestRejectedShownToSecondaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestReminder
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestReminderShownToPrimaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestReminderShownToSecondaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestRevoked
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestSentShownToPrimaryTeam
//     | DropboxTypes$team_log$EventTypeTeamMergeRequestSentShownToSecondaryTeam
//     | DropboxTypes$team_log$EventTypeOther;

//   /**
//   * Created member data report.
//   */
//   declare interface DropboxTypes$team_log$ExportMembersReportDetails {}

//   declare interface DropboxTypes$team_log$ExportMembersReportType {
//     description: string;
//   }

//   /**
//   * Accepted/opted out of extended version history.
//   */
//   declare interface DropboxTypes$team_log$ExtendedVersionHistoryChangePolicyDetails {
//     /**
//     * New extended version history policy.
//     */
//     new_value: DropboxTypes$team_log$ExtendedVersionHistoryPolicy;

//     /**
//     * Previous extended version history policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$ExtendedVersionHistoryPolicy;
//   }

//   declare interface DropboxTypes$team_log$ExtendedVersionHistoryChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$ExtendedVersionHistoryPolicyExplicitlyLimited {
//     ".tag": "explicitly_limited";
//   }

//   declare interface DropboxTypes$team_log$ExtendedVersionHistoryPolicyExplicitlyUnlimited {
//     ".tag": "explicitly_unlimited";
//   }

//   declare interface DropboxTypes$team_log$ExtendedVersionHistoryPolicyImplicitlyLimited {
//     ".tag": "implicitly_limited";
//   }

//   declare interface DropboxTypes$team_log$ExtendedVersionHistoryPolicyImplicitlyUnlimited {
//     ".tag": "implicitly_unlimited";
//   }

//   declare interface DropboxTypes$team_log$ExtendedVersionHistoryPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$ExtendedVersionHistoryPolicy =
//     | DropboxTypes$team_log$ExtendedVersionHistoryPolicyExplicitlyLimited
//     | DropboxTypes$team_log$ExtendedVersionHistoryPolicyExplicitlyUnlimited
//     | DropboxTypes$team_log$ExtendedVersionHistoryPolicyImplicitlyLimited
//     | DropboxTypes$team_log$ExtendedVersionHistoryPolicyImplicitlyUnlimited
//     | DropboxTypes$team_log$ExtendedVersionHistoryPolicyOther;

//   /**
//   * A user without a Dropbox account.
//   */
//   declare interface DropboxTypes$team_log$ExternalUserLogInfo {
//     /**
//     * An external user identifier.
//     */
//     user_identifier: string;

//     /**
//     * Identifier type.
//     */
//     identifier_type: DropboxTypes$team_log$IdentifierType;
//   }

//   /**
//   * Provides details about a failure
//   */
//   declare interface DropboxTypes$team_log$FailureDetailsLogInfo {
//     /**
//     * A user friendly explanation of the error. Might be missing due to
//     * historical data gap.
//     */
//     user_friendly_message?: string;

//     /**
//     * A technical explanation of the error. This is relevant for some errors.
//     */
//     technical_error_message?: string;
//   }

//   /**
//   * Added file comment.
//   */
//   declare interface DropboxTypes$team_log$FileAddCommentDetails {
//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$FileAddCommentType {
//     description: string;
//   }

//   /**
//   * Added files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FileAddDetails {}

//   declare interface DropboxTypes$team_log$FileAddType {
//     description: string;
//   }

//   /**
//   * Subscribed to or unsubscribed from comment notifications for file.
//   */
//   declare interface DropboxTypes$team_log$FileChangeCommentSubscriptionDetails {
//     /**
//     * New file comment subscription.
//     */
//     new_value: DropboxTypes$team_log$FileCommentNotificationPolicy;

//     /**
//     * Previous file comment subscription. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$team_log$FileCommentNotificationPolicy;
//   }

//   declare interface DropboxTypes$team_log$FileChangeCommentSubscriptionType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$FileCommentNotificationPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$FileCommentNotificationPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$FileCommentNotificationPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Enable or disable file comments notifications
//   */
//   declare type DropboxTypes$team_log$FileCommentNotificationPolicy =
//     | DropboxTypes$team_log$FileCommentNotificationPolicyDisabled
//     | DropboxTypes$team_log$FileCommentNotificationPolicyEnabled
//     | DropboxTypes$team_log$FileCommentNotificationPolicyOther;

//   /**
//   * Enabled/disabled commenting on team files.
//   */
//   declare interface DropboxTypes$team_log$FileCommentsChangePolicyDetails {
//     /**
//     * New commenting on team files policy.
//     */
//     new_value: DropboxTypes$team_log$FileCommentsPolicy;

//     /**
//     * Previous commenting on team files policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$FileCommentsPolicy;
//   }

//   declare interface DropboxTypes$team_log$FileCommentsChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$FileCommentsPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$FileCommentsPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$FileCommentsPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * File comments policy
//   */
//   declare type DropboxTypes$team_log$FileCommentsPolicy =
//     | DropboxTypes$team_log$FileCommentsPolicyDisabled
//     | DropboxTypes$team_log$FileCommentsPolicyEnabled
//     | DropboxTypes$team_log$FileCommentsPolicyOther;

//   /**
//   * Copied files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FileCopyDetails {
//     /**
//     * Relocate action details.
//     */
//     relocate_action_details: Array<DropboxTypes$team_log$RelocateAssetReferencesLogInfo>;
//   }

//   declare interface DropboxTypes$team_log$FileCopyType {
//     description: string;
//   }

//   /**
//   * Deleted file comment.
//   */
//   declare interface DropboxTypes$team_log$FileDeleteCommentDetails {
//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$FileDeleteCommentType {
//     description: string;
//   }

//   /**
//   * Deleted files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FileDeleteDetails {}

//   declare interface DropboxTypes$team_log$FileDeleteType {
//     description: string;
//   }

//   /**
//   * Downloaded files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FileDownloadDetails {}

//   declare interface DropboxTypes$team_log$FileDownloadType {
//     description: string;
//   }

//   /**
//   * Edited file comment.
//   */
//   declare interface DropboxTypes$team_log$FileEditCommentDetails {
//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;

//     /**
//     * Previous comment text.
//     */
//     previous_comment_text: string;
//   }

//   declare interface DropboxTypes$team_log$FileEditCommentType {
//     description: string;
//   }

//   /**
//   * Edited files.
//   */
//   declare interface DropboxTypes$team_log$FileEditDetails {}

//   declare interface DropboxTypes$team_log$FileEditType {
//     description: string;
//   }

//   /**
//   * Created copy reference to file/folder.
//   */
//   declare interface DropboxTypes$team_log$FileGetCopyReferenceDetails {}

//   declare interface DropboxTypes$team_log$FileGetCopyReferenceType {
//     description: string;
//   }

//   /**
//   * Liked file comment.
//   */
//   declare interface DropboxTypes$team_log$FileLikeCommentDetails {
//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$FileLikeCommentType {
//     description: string;
//   }

//   /**
//   * File's logged information.
//   */
//   declare type DropboxTypes$team_log$FileLogInfo = {
//     ...
//   } & DropboxTypes$team_log$FileOrFolderLogInfo;

//   /**
//   * Moved files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FileMoveDetails {
//     /**
//     * Relocate action details.
//     */
//     relocate_action_details: Array<DropboxTypes$team_log$RelocateAssetReferencesLogInfo>;
//   }

//   declare interface DropboxTypes$team_log$FileMoveType {
//     description: string;
//   }

//   /**
//   * Generic information relevant both for files and folders
//   */
//   declare interface DropboxTypes$team_log$FileOrFolderLogInfo {
//     /**
//     * Path relative to event context.
//     */
//     path: DropboxTypes$team_log$PathLogInfo;

//     /**
//     * Display name. Might be missing due to historical data gap.
//     */
//     display_name?: string;

//     /**
//     * Unique ID. Might be missing due to historical data gap.
//     */
//     file_id?: string;
//   }

//   /**
//   * Permanently deleted files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FilePermanentlyDeleteDetails {}

//   declare interface DropboxTypes$team_log$FilePermanentlyDeleteType {
//     description: string;
//   }

//   /**
//   * Previewed files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FilePreviewDetails {}

//   declare interface DropboxTypes$team_log$FilePreviewType {
//     description: string;
//   }

//   /**
//   * Renamed files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FileRenameDetails {
//     /**
//     * Relocate action details.
//     */
//     relocate_action_details: Array<DropboxTypes$team_log$RelocateAssetReferencesLogInfo>;
//   }

//   declare interface DropboxTypes$team_log$FileRenameType {
//     description: string;
//   }

//   /**
//   * Changed file request.
//   */
//   declare interface DropboxTypes$team_log$FileRequestChangeDetails {
//     /**
//     * File request id. Might be missing due to historical data gap.
//     */
//     file_request_id?: DropboxTypes$file_requests$FileRequestId;

//     /**
//     * Previous file request details. Might be missing due to historical data
//     * gap.
//     */
//     previous_details?: DropboxTypes$team_log$FileRequestDetails;

//     /**
//     * New file request details.
//     */
//     new_details: DropboxTypes$team_log$FileRequestDetails;
//   }

//   declare interface DropboxTypes$team_log$FileRequestChangeType {
//     description: string;
//   }

//   /**
//   * Closed file request.
//   */
//   declare interface DropboxTypes$team_log$FileRequestCloseDetails {
//     /**
//     * File request id. Might be missing due to historical data gap.
//     */
//     file_request_id?: DropboxTypes$file_requests$FileRequestId;

//     /**
//     * Previous file request details. Might be missing due to historical data
//     * gap.
//     */
//     previous_details?: DropboxTypes$team_log$FileRequestDetails;
//   }

//   declare interface DropboxTypes$team_log$FileRequestCloseType {
//     description: string;
//   }

//   /**
//   * Created file request.
//   */
//   declare interface DropboxTypes$team_log$FileRequestCreateDetails {
//     /**
//     * File request id. Might be missing due to historical data gap.
//     */
//     file_request_id?: DropboxTypes$file_requests$FileRequestId;

//     /**
//     * File request details. Might be missing due to historical data gap.
//     */
//     request_details?: DropboxTypes$team_log$FileRequestDetails;
//   }

//   declare interface DropboxTypes$team_log$FileRequestCreateType {
//     description: string;
//   }

//   /**
//   * File request deadline
//   */
//   declare interface DropboxTypes$team_log$FileRequestDeadline {
//     /**
//     * The deadline for this file request. Might be missing due to historical
//     * data gap.
//     */
//     deadline?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * If set, allow uploads after the deadline has passed. Might be missing
//     * due to historical data gap.
//     */
//     allow_late_uploads?: string;
//   }

//   /**
//   * Delete file request.
//   */
//   declare interface DropboxTypes$team_log$FileRequestDeleteDetails {
//     /**
//     * File request id. Might be missing due to historical data gap.
//     */
//     file_request_id?: DropboxTypes$file_requests$FileRequestId;

//     /**
//     * Previous file request details. Might be missing due to historical data
//     * gap.
//     */
//     previous_details?: DropboxTypes$team_log$FileRequestDetails;
//   }

//   declare interface DropboxTypes$team_log$FileRequestDeleteType {
//     description: string;
//   }

//   /**
//   * File request details
//   */
//   declare interface DropboxTypes$team_log$FileRequestDetails {
//     /**
//     * Asset position in the Assets list.
//     */
//     asset_index: number;

//     /**
//     * File request deadline. Might be missing due to historical data gap.
//     */
//     deadline?: DropboxTypes$team_log$FileRequestDeadline;
//   }

//   /**
//   * Received files for file request.
//   */
//   declare interface DropboxTypes$team_log$FileRequestReceiveFileDetails {
//     /**
//     * File request id. Might be missing due to historical data gap.
//     */
//     file_request_id?: DropboxTypes$file_requests$FileRequestId;

//     /**
//     * File request details. Might be missing due to historical data gap.
//     */
//     file_request_details?: DropboxTypes$team_log$FileRequestDetails;

//     /**
//     * Submitted file names.
//     */
//     submitted_file_names: Array<string>;

//     /**
//     * The name as provided by the submitter. Might be missing due to
//     * historical data gap.
//     */
//     submitter_name?: DropboxTypes$common$DisplayNameLegacy;

//     /**
//     * The email as provided by the submitter. Might be missing due to
//     * historical data gap.
//     */
//     submitter_email?: DropboxTypes$team_log$EmailAddress;
//   }

//   declare interface DropboxTypes$team_log$FileRequestReceiveFileType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled file requests.
//   */
//   declare interface DropboxTypes$team_log$FileRequestsChangePolicyDetails {
//     /**
//     * New file requests policy.
//     */
//     new_value: DropboxTypes$team_log$FileRequestsPolicy;

//     /**
//     * Previous file requests policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_log$FileRequestsPolicy;
//   }

//   declare interface DropboxTypes$team_log$FileRequestsChangePolicyType {
//     description: string;
//   }

//   /**
//   * Enabled file request emails for everyone.
//   */
//   declare interface DropboxTypes$team_log$FileRequestsEmailsEnabledDetails {}

//   declare interface DropboxTypes$team_log$FileRequestsEmailsEnabledType {
//     description: string;
//   }

//   /**
//   * Enabled file request emails for team.
//   */
//   declare interface DropboxTypes$team_log$FileRequestsEmailsRestrictedToTeamOnlyDetails {}

//   declare interface DropboxTypes$team_log$FileRequestsEmailsRestrictedToTeamOnlyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$FileRequestsPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$FileRequestsPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$FileRequestsPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * File requests policy
//   */
//   declare type DropboxTypes$team_log$FileRequestsPolicy =
//     | DropboxTypes$team_log$FileRequestsPolicyDisabled
//     | DropboxTypes$team_log$FileRequestsPolicyEnabled
//     | DropboxTypes$team_log$FileRequestsPolicyOther;

//   /**
//   * Resolved file comment.
//   */
//   declare interface DropboxTypes$team_log$FileResolveCommentDetails {
//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$FileResolveCommentType {
//     description: string;
//   }

//   /**
//   * Restored deleted files and/or folders.
//   */
//   declare interface DropboxTypes$team_log$FileRestoreDetails {}

//   declare interface DropboxTypes$team_log$FileRestoreType {
//     description: string;
//   }

//   /**
//   * Reverted files to previous version.
//   */
//   declare interface DropboxTypes$team_log$FileRevertDetails {}

//   declare interface DropboxTypes$team_log$FileRevertType {
//     description: string;
//   }

//   /**
//   * Rolled back file actions.
//   */
//   declare interface DropboxTypes$team_log$FileRollbackChangesDetails {}

//   declare interface DropboxTypes$team_log$FileRollbackChangesType {
//     description: string;
//   }

//   /**
//   * Saved file/folder using copy reference.
//   */
//   declare interface DropboxTypes$team_log$FileSaveCopyReferenceDetails {
//     /**
//     * Relocate action details.
//     */
//     relocate_action_details: Array<DropboxTypes$team_log$RelocateAssetReferencesLogInfo>;
//   }

//   declare interface DropboxTypes$team_log$FileSaveCopyReferenceType {
//     description: string;
//   }

//   /**
//   * Unliked file comment.
//   */
//   declare interface DropboxTypes$team_log$FileUnlikeCommentDetails {
//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$FileUnlikeCommentType {
//     description: string;
//   }

//   /**
//   * Unresolved file comment.
//   */
//   declare interface DropboxTypes$team_log$FileUnresolveCommentDetails {
//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$FileUnresolveCommentType {
//     description: string;
//   }

//   /**
//   * Folder's logged information.
//   */
//   declare type DropboxTypes$team_log$FolderLogInfo = {
//     ...
//   } & DropboxTypes$team_log$FileOrFolderLogInfo;

//   /**
//   * Geographic location details.
//   */
//   declare interface DropboxTypes$team_log$GeoLocationLogInfo {
//     /**
//     * City name.
//     */
//     city?: string;

//     /**
//     * Region name.
//     */
//     region?: string;

//     /**
//     * Country code.
//     */
//     country?: string;

//     /**
//     * IP address.
//     */
//     ip_address: DropboxTypes$team_log$IpAddress;
//   }

//   declare interface DropboxTypes$team_log$GetTeamEventsArg {
//     /**
//     * Defaults to 1000.
//     */
//     limit?: number;

//     /**
//     * Filter the events by account ID. Return ony events with this account_id
//     * as either Actor, Context, or Participants.
//     */
//     account_id?: DropboxTypes$users_common$AccountId;

//     /**
//     * Filter by time range.
//     */
//     time?: DropboxTypes$team_common$TimeRange;

//     /**
//     * Filter the returned events to a single category.
//     */
//     category?: DropboxTypes$team_log$EventCategory;
//   }

//   declare interface DropboxTypes$team_log$GetTeamEventsContinueArg {
//     /**
//     * Indicates from what point to get the next set of events.
//     */
//     cursor: string;
//   }

//   /**
//   * Bad cursor.
//   */
//   declare interface DropboxTypes$team_log$GetTeamEventsContinueErrorBadCursor {
//     ".tag": "bad_cursor";
//   }

//   /**
//   * Cursors are intended to be used quickly. Individual cursor values are
//   * normally valid for days, but in rare cases may be reset sooner. Cursor
//   * reset errors should be handled by fetching a new cursor from getEvents().
//   * The associated value is the approximate timestamp of the most recent
//   * event returned by the cursor. This should be used as a resumption point
//   * when calling getEvents() to obtain a new cursor.
//   */
//   declare interface DropboxTypes$team_log$GetTeamEventsContinueErrorReset {
//     ".tag": "reset";
//     reset: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team_log$GetTeamEventsContinueErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Errors that can be raised when calling getEventsContinue().
//   */
//   declare type DropboxTypes$team_log$GetTeamEventsContinueError =
//     | DropboxTypes$team_log$GetTeamEventsContinueErrorBadCursor
//     | DropboxTypes$team_log$GetTeamEventsContinueErrorReset
//     | DropboxTypes$team_log$GetTeamEventsContinueErrorOther;

//   /**
//   * No user found matching the provided account_id.
//   */
//   declare interface DropboxTypes$team_log$GetTeamEventsErrorAccountIdNotFound {
//     ".tag": "account_id_not_found";
//   }

//   /**
//   * Invalid time range.
//   */
//   declare interface DropboxTypes$team_log$GetTeamEventsErrorInvalidTimeRange {
//     ".tag": "invalid_time_range";
//   }

//   declare interface DropboxTypes$team_log$GetTeamEventsErrorOther {
//     ".tag": "other";
//   }

//   /**
//   * Errors that can be raised when calling getEvents().
//   */
//   declare type DropboxTypes$team_log$GetTeamEventsError =
//     | DropboxTypes$team_log$GetTeamEventsErrorAccountIdNotFound
//     | DropboxTypes$team_log$GetTeamEventsErrorInvalidTimeRange
//     | DropboxTypes$team_log$GetTeamEventsErrorOther;

//   declare interface DropboxTypes$team_log$GetTeamEventsResult {
//     /**
//     * List of events. Note that events are not guaranteed to be sorted by
//     * their timestamp value.
//     */
//     events: Array<DropboxTypes$team_log$TeamEvent>;

//     /**
//     * Pass the cursor into getEventsContinue() to obtain additional events.
//     * The value of cursor may change for each response from
//     * getEventsContinue(), regardless of the value of has_more; older cursor
//     * strings may expire. Thus, callers should ensure that they update their
//     * cursor based on the latest value of cursor after each call, and poll
//     * regularly if they wish to poll for new events. Callers should handle
//     * reset exceptions for expired cursors.
//     */
//     cursor: string;

//     /**
//     * Is true if there may be additional events that have not been returned
//     * yet. An additional call to getEventsContinue() can retrieve them. Note
//     * that has_more may be true, even if events is empty.
//     */
//     has_more: boolean;
//   }

//   /**
//   * Enabled/disabled Google single sign-on for team.
//   */
//   declare interface DropboxTypes$team_log$GoogleSsoChangePolicyDetails {
//     /**
//     * New Google single sign-on policy.
//     */
//     new_value: DropboxTypes$team_log$GoogleSsoPolicy;

//     /**
//     * Previous Google single sign-on policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$GoogleSsoPolicy;
//   }

//   declare interface DropboxTypes$team_log$GoogleSsoChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$GoogleSsoPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$GoogleSsoPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$GoogleSsoPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Google SSO policy
//   */
//   declare type DropboxTypes$team_log$GoogleSsoPolicy =
//     | DropboxTypes$team_log$GoogleSsoPolicyDisabled
//     | DropboxTypes$team_log$GoogleSsoPolicyEnabled
//     | DropboxTypes$team_log$GoogleSsoPolicyOther;

//   /**
//   * Added external ID for group.
//   */
//   declare interface DropboxTypes$team_log$GroupAddExternalIdDetails {
//     /**
//     * Current external id.
//     */
//     new_value: DropboxTypes$team_common$GroupExternalId;
//   }

//   declare interface DropboxTypes$team_log$GroupAddExternalIdType {
//     description: string;
//   }

//   /**
//   * Added team members to group.
//   */
//   declare interface DropboxTypes$team_log$GroupAddMemberDetails {
//     /**
//     * Is group owner.
//     */
//     is_group_owner: boolean;
//   }

//   declare interface DropboxTypes$team_log$GroupAddMemberType {
//     description: string;
//   }

//   /**
//   * Changed external ID for group.
//   */
//   declare interface DropboxTypes$team_log$GroupChangeExternalIdDetails {
//     /**
//     * Current external id.
//     */
//     new_value: DropboxTypes$team_common$GroupExternalId;

//     /**
//     * Old external id.
//     */
//     previous_value: DropboxTypes$team_common$GroupExternalId;
//   }

//   declare interface DropboxTypes$team_log$GroupChangeExternalIdType {
//     description: string;
//   }

//   /**
//   * Changed group management type.
//   */
//   declare interface DropboxTypes$team_log$GroupChangeManagementTypeDetails {
//     /**
//     * New group management type.
//     */
//     new_value: DropboxTypes$team_common$GroupManagementType;

//     /**
//     * Previous group management type. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_common$GroupManagementType;
//   }

//   declare interface DropboxTypes$team_log$GroupChangeManagementTypeType {
//     description: string;
//   }

//   /**
//   * Changed manager permissions of group member.
//   */
//   declare interface DropboxTypes$team_log$GroupChangeMemberRoleDetails {
//     /**
//     * Is group owner.
//     */
//     is_group_owner: boolean;
//   }

//   declare interface DropboxTypes$team_log$GroupChangeMemberRoleType {
//     description: string;
//   }

//   /**
//   * Created group.
//   */
//   declare interface DropboxTypes$team_log$GroupCreateDetails {
//     /**
//     * Is company managed group. Might be missing due to historical data gap.
//     */
//     is_company_managed?: boolean;

//     /**
//     * Group join policy.
//     */
//     join_policy?: DropboxTypes$team_log$GroupJoinPolicy;
//   }

//   declare interface DropboxTypes$team_log$GroupCreateType {
//     description: string;
//   }

//   /**
//   * Deleted group.
//   */
//   declare interface DropboxTypes$team_log$GroupDeleteDetails {
//     /**
//     * Is company managed group. Might be missing due to historical data gap.
//     */
//     is_company_managed?: boolean;
//   }

//   declare interface DropboxTypes$team_log$GroupDeleteType {
//     description: string;
//   }

//   /**
//   * Updated group.
//   */
//   declare interface DropboxTypes$team_log$GroupDescriptionUpdatedDetails {}

//   declare interface DropboxTypes$team_log$GroupDescriptionUpdatedType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$GroupJoinPolicyOpen {
//     ".tag": "open";
//   }

//   declare interface DropboxTypes$team_log$GroupJoinPolicyRequestToJoin {
//     ".tag": "request_to_join";
//   }

//   declare interface DropboxTypes$team_log$GroupJoinPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$GroupJoinPolicy =
//     | DropboxTypes$team_log$GroupJoinPolicyOpen
//     | DropboxTypes$team_log$GroupJoinPolicyRequestToJoin
//     | DropboxTypes$team_log$GroupJoinPolicyOther;

//   /**
//   * Updated group join policy.
//   */
//   declare interface DropboxTypes$team_log$GroupJoinPolicyUpdatedDetails {
//     /**
//     * Is company managed group. Might be missing due to historical data gap.
//     */
//     is_company_managed?: boolean;

//     /**
//     * Group join policy.
//     */
//     join_policy?: DropboxTypes$team_log$GroupJoinPolicy;
//   }

//   declare interface DropboxTypes$team_log$GroupJoinPolicyUpdatedType {
//     description: string;
//   }

//   /**
//   * Group's logged information.
//   */
//   declare interface DropboxTypes$team_log$GroupLogInfo {
//     /**
//     * The unique id of this group. Might be missing due to historical data
//     * gap.
//     */
//     group_id?: DropboxTypes$team_common$GroupId;

//     /**
//     * The name of this group.
//     */
//     display_name: string;

//     /**
//     * External group ID. Might be missing due to historical data gap.
//     */
//     external_id?: DropboxTypes$team_common$GroupExternalId;
//   }

//   /**
//   * Moved group.
//   */
//   declare interface DropboxTypes$team_log$GroupMovedDetails {}

//   declare interface DropboxTypes$team_log$GroupMovedType {
//     description: string;
//   }

//   /**
//   * Removed external ID for group.
//   */
//   declare interface DropboxTypes$team_log$GroupRemoveExternalIdDetails {
//     /**
//     * Old external id.
//     */
//     previous_value: DropboxTypes$team_common$GroupExternalId;
//   }

//   declare interface DropboxTypes$team_log$GroupRemoveExternalIdType {
//     description: string;
//   }

//   /**
//   * Removed team members from group.
//   */
//   declare interface DropboxTypes$team_log$GroupRemoveMemberDetails {}

//   declare interface DropboxTypes$team_log$GroupRemoveMemberType {
//     description: string;
//   }

//   /**
//   * Renamed group.
//   */
//   declare interface DropboxTypes$team_log$GroupRenameDetails {
//     /**
//     * Previous display name.
//     */
//     previous_value: string;

//     /**
//     * New display name.
//     */
//     new_value: string;
//   }

//   declare interface DropboxTypes$team_log$GroupRenameType {
//     description: string;
//   }

//   /**
//   * Changed who can create groups.
//   */
//   declare interface DropboxTypes$team_log$GroupUserManagementChangePolicyDetails {
//     /**
//     * New group users management policy.
//     */
//     new_value: DropboxTypes$team_policies$GroupCreation;

//     /**
//     * Previous group users management policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_policies$GroupCreation;
//   }

//   declare interface DropboxTypes$team_log$GroupUserManagementChangePolicyType {
//     description: string;
//   }

//   /**
//   * Changed guest team admin status.
//   */
//   declare interface DropboxTypes$team_log$GuestAdminChangeStatusDetails {
//     /**
//     * True for guest, false for host.
//     */
//     is_guest: boolean;

//     /**
//     * The name of the guest team.
//     */
//     guest_team_name?: string;

//     /**
//     * The name of the host team.
//     */
//     host_team_name?: string;

//     /**
//     * Previous request state.
//     */
//     previous_value: DropboxTypes$team_log$TrustedTeamsRequestState;

//     /**
//     * New request state.
//     */
//     new_value: DropboxTypes$team_log$TrustedTeamsRequestState;

//     /**
//     * Action details.
//     */
//     action_details: DropboxTypes$team_log$TrustedTeamsRequestAction;
//   }

//   declare interface DropboxTypes$team_log$GuestAdminChangeStatusType {
//     description: string;
//   }

//   /**
//   * Started trusted team admin session.
//   */
//   declare interface DropboxTypes$team_log$GuestAdminSignedInViaTrustedTeamsDetails {
//     /**
//     * Host team name.
//     */
//     team_name?: string;

//     /**
//     * Trusted team name.
//     */
//     trusted_team_name?: string;
//   }

//   declare interface DropboxTypes$team_log$GuestAdminSignedInViaTrustedTeamsType {
//     description: string;
//   }

//   /**
//   * Ended trusted team admin session.
//   */
//   declare interface DropboxTypes$team_log$GuestAdminSignedOutViaTrustedTeamsDetails {
//     /**
//     * Host team name.
//     */
//     team_name?: string;

//     /**
//     * Trusted team name.
//     */
//     trusted_team_name?: string;
//   }

//   declare interface DropboxTypes$team_log$GuestAdminSignedOutViaTrustedTeamsType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$IdentifierTypeEmail {
//     ".tag": "email";
//   }

//   declare interface DropboxTypes$team_log$IdentifierTypeFacebookProfileName {
//     ".tag": "facebook_profile_name";
//   }

//   declare interface DropboxTypes$team_log$IdentifierTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$IdentifierType =
//     | DropboxTypes$team_log$IdentifierTypeEmail
//     | DropboxTypes$team_log$IdentifierTypeFacebookProfileName
//     | DropboxTypes$team_log$IdentifierTypeOther;

//   /**
//   * Connected integration for member.
//   */
//   declare interface DropboxTypes$team_log$IntegrationConnectedDetails {
//     /**
//     * Name of the third-party integration.
//     */
//     integration_name: string;
//   }

//   declare interface DropboxTypes$team_log$IntegrationConnectedType {
//     description: string;
//   }

//   /**
//   * Disconnected integration for member.
//   */
//   declare interface DropboxTypes$team_log$IntegrationDisconnectedDetails {
//     /**
//     * Name of the third-party integration.
//     */
//     integration_name: string;
//   }

//   declare interface DropboxTypes$team_log$IntegrationDisconnectedType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$IntegrationPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$IntegrationPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$IntegrationPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling whether a service integration is enabled for the
//   * team.
//   */
//   declare type DropboxTypes$team_log$IntegrationPolicy =
//     | DropboxTypes$team_log$IntegrationPolicyDisabled
//     | DropboxTypes$team_log$IntegrationPolicyEnabled
//     | DropboxTypes$team_log$IntegrationPolicyOther;

//   /**
//   * Changed integration policy for team.
//   */
//   declare interface DropboxTypes$team_log$IntegrationPolicyChangedDetails {
//     /**
//     * Name of the third-party integration.
//     */
//     integration_name: string;

//     /**
//     * New integration policy.
//     */
//     new_value: DropboxTypes$team_log$IntegrationPolicy;

//     /**
//     * Previous integration policy.
//     */
//     previous_value: DropboxTypes$team_log$IntegrationPolicy;
//   }

//   declare interface DropboxTypes$team_log$IntegrationPolicyChangedType {
//     description: string;
//   }

//   /**
//   * Additional information relevant when a new member joins the team.
//   */
//   declare interface DropboxTypes$team_log$JoinTeamDetails {
//     /**
//     * Linked applications.
//     */
//     linked_apps: Array<DropboxTypes$team_log$UserLinkedAppLogInfo>;

//     /**
//     * Linked devices.
//     */
//     linked_devices: Array<DropboxTypes$team_log$LinkedDeviceLogInfo>;

//     /**
//     * Linked shared folders.
//     */
//     linked_shared_folders: Array<DropboxTypes$team_log$FolderLogInfo>;
//   }

//   /**
//   * Information on sessions, in legacy format
//   */
//   declare type DropboxTypes$team_log$LegacyDeviceSessionLogInfo = {
//     /**
//     * Session unique id. Might be missing due to historical data gap.
//     */
//     session_info?:
//       | DropboxTypes$team_log$WebSessionLogInfoReference
//       | DropboxTypes$team_log$DesktopSessionLogInfoReference
//       | DropboxTypes$team_log$MobileSessionLogInfoReference
//       | DropboxTypes$team_log$SessionLogInfoReference,

//     /**
//     * The device name. Might be missing due to historical data gap.
//     */
//     display_name?: string,

//     /**
//     * Is device managed by emm. Might be missing due to historical data gap.
//     */
//     is_emm_managed?: boolean,

//     /**
//     * Information on the hosting platform. Might be missing due to historical
//     * data gap.
//     */
//     platform?: string,

//     /**
//     * The mac address of the last activity from this session. Might be
//     * missing due to historical data gap.
//     */
//     mac_address?: DropboxTypes$team_log$IpAddress,

//     /**
//     * The hosting OS version. Might be missing due to historical data gap.
//     */
//     os_version?: string,

//     /**
//     * Information on the hosting device type. Might be missing due to
//     * historical data gap.
//     */
//     device_type?: string,

//     /**
//     * The Dropbox client version. Might be missing due to historical data
//     * gap.
//     */
//     client_version?: string,

//     /**
//     * Alternative unique device session id, instead of session id field.
//     * Might be missing due to historical data gap.
//     */
//     legacy_uniq_id?: string,
//     ...
//   } & DropboxTypes$team_log$DeviceSessionLogInfo;

//   /**
//   * Reference to the LegacyDeviceSessionLogInfo type, identified by the value
//   * of the .tag property.
//   */
//   declare type DropboxTypes$team_log$LegacyDeviceSessionLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "legacy_device_session",
//     ...
//   } & DropboxTypes$team_log$LegacyDeviceSessionLogInfo;

//   /**
//   * mobile device session's details.
//   */
//   declare type DropboxTypes$team_log$LinkedDeviceLogInfoMobileDeviceSession = {
//     ".tag": "mobile_device_session",
//     ...
//   } & DropboxTypes$team_log$MobileDeviceSessionLogInfo;

//   /**
//   * desktop device session's details.
//   */
//   declare type DropboxTypes$team_log$LinkedDeviceLogInfoDesktopDeviceSession = {
//     ".tag": "desktop_device_session",
//     ...
//   } & DropboxTypes$team_log$DesktopDeviceSessionLogInfo;

//   /**
//   * web device session's details.
//   */
//   declare type DropboxTypes$team_log$LinkedDeviceLogInfoWebDeviceSession = {
//     ".tag": "web_device_session",
//     ...
//   } & DropboxTypes$team_log$WebDeviceSessionLogInfo;

//   /**
//   * legacy device session's details.
//   */
//   declare type DropboxTypes$team_log$LinkedDeviceLogInfoLegacyDeviceSession = {
//     ".tag": "legacy_device_session",
//     ...
//   } & DropboxTypes$team_log$LegacyDeviceSessionLogInfo;

//   declare interface DropboxTypes$team_log$LinkedDeviceLogInfoOther {
//     ".tag": "other";
//   }

//   /**
//   * The device sessions that user is linked to.
//   */
//   declare type DropboxTypes$team_log$LinkedDeviceLogInfo =
//     | DropboxTypes$team_log$LinkedDeviceLogInfoMobileDeviceSession
//     | DropboxTypes$team_log$LinkedDeviceLogInfoDesktopDeviceSession
//     | DropboxTypes$team_log$LinkedDeviceLogInfoWebDeviceSession
//     | DropboxTypes$team_log$LinkedDeviceLogInfoLegacyDeviceSession
//     | DropboxTypes$team_log$LinkedDeviceLogInfoOther;

//   /**
//   * Failed to sign in.
//   */
//   declare interface DropboxTypes$team_log$LoginFailDetails {
//     /**
//     * Tells if the login device is EMM managed. Might be missing due to
//     * historical data gap.
//     */
//     is_emm_managed?: boolean;

//     /**
//     * Login method.
//     */
//     login_method: DropboxTypes$team_log$LoginMethod;

//     /**
//     * Error details.
//     */
//     error_details: DropboxTypes$team_log$FailureDetailsLogInfo;
//   }

//   declare interface DropboxTypes$team_log$LoginFailType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$LoginMethodPassword {
//     ".tag": "password";
//   }

//   declare interface DropboxTypes$team_log$LoginMethodTwoFactorAuthentication {
//     ".tag": "two_factor_authentication";
//   }

//   declare interface DropboxTypes$team_log$LoginMethodSaml {
//     ".tag": "saml";
//   }

//   declare interface DropboxTypes$team_log$LoginMethodGoogleOauth {
//     ".tag": "google_oauth";
//   }

//   declare interface DropboxTypes$team_log$LoginMethodOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$LoginMethod =
//     | DropboxTypes$team_log$LoginMethodPassword
//     | DropboxTypes$team_log$LoginMethodTwoFactorAuthentication
//     | DropboxTypes$team_log$LoginMethodSaml
//     | DropboxTypes$team_log$LoginMethodGoogleOauth
//     | DropboxTypes$team_log$LoginMethodOther;

//   /**
//   * Signed in.
//   */
//   declare interface DropboxTypes$team_log$LoginSuccessDetails {
//     /**
//     * Tells if the login device is EMM managed. Might be missing due to
//     * historical data gap.
//     */
//     is_emm_managed?: boolean;

//     /**
//     * Login method.
//     */
//     login_method: DropboxTypes$team_log$LoginMethod;
//   }

//   declare interface DropboxTypes$team_log$LoginSuccessType {
//     description: string;
//   }

//   /**
//   * Signed out.
//   */
//   declare interface DropboxTypes$team_log$LogoutDetails {}

//   declare interface DropboxTypes$team_log$LogoutType {
//     description: string;
//   }

//   /**
//   * Added an external ID for team member.
//   */
//   declare interface DropboxTypes$team_log$MemberAddExternalIdDetails {
//     /**
//     * Current external id.
//     */
//     new_value: DropboxTypes$team_common$MemberExternalId;
//   }

//   declare interface DropboxTypes$team_log$MemberAddExternalIdType {
//     description: string;
//   }

//   /**
//   * Added team member name.
//   */
//   declare interface DropboxTypes$team_log$MemberAddNameDetails {
//     /**
//     * New user's name.
//     */
//     new_value: DropboxTypes$team_log$UserNameLogInfo;
//   }

//   declare interface DropboxTypes$team_log$MemberAddNameType {
//     description: string;
//   }

//   /**
//   * Changed team member admin role.
//   */
//   declare interface DropboxTypes$team_log$MemberChangeAdminRoleDetails {
//     /**
//     * New admin role. This field is relevant when the admin role is changed
//     * or whenthe user role changes from no admin rights to with admin rights.
//     */
//     new_value?: DropboxTypes$team_log$AdminRole;

//     /**
//     * Previous admin role. This field is relevant when the admin role is
//     * changed or when the admin role is removed.
//     */
//     previous_value?: DropboxTypes$team_log$AdminRole;
//   }

//   declare interface DropboxTypes$team_log$MemberChangeAdminRoleType {
//     description: string;
//   }

//   /**
//   * Changed team member email.
//   */
//   declare interface DropboxTypes$team_log$MemberChangeEmailDetails {
//     /**
//     * New email.
//     */
//     new_value: DropboxTypes$team_log$EmailAddress;

//     /**
//     * Previous email. Might be missing due to historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$EmailAddress;
//   }

//   declare interface DropboxTypes$team_log$MemberChangeEmailType {
//     description: string;
//   }

//   /**
//   * Changed the external ID for team member.
//   */
//   declare interface DropboxTypes$team_log$MemberChangeExternalIdDetails {
//     /**
//     * Current external id.
//     */
//     new_value: DropboxTypes$team_common$MemberExternalId;

//     /**
//     * Old external id.
//     */
//     previous_value: DropboxTypes$team_common$MemberExternalId;
//   }

//   declare interface DropboxTypes$team_log$MemberChangeExternalIdType {
//     description: string;
//   }

//   /**
//   * Changed membership type (limited/full) of member.
//   */
//   declare interface DropboxTypes$team_log$MemberChangeMembershipTypeDetails {
//     /**
//     * Previous membership type.
//     */
//     prev_value: DropboxTypes$team_log$TeamMembershipType;

//     /**
//     * New membership type.
//     */
//     new_value: DropboxTypes$team_log$TeamMembershipType;
//   }

//   declare interface DropboxTypes$team_log$MemberChangeMembershipTypeType {
//     description: string;
//   }

//   /**
//   * Changed team member name.
//   */
//   declare interface DropboxTypes$team_log$MemberChangeNameDetails {
//     /**
//     * New user's name.
//     */
//     new_value: DropboxTypes$team_log$UserNameLogInfo;

//     /**
//     * Previous user's name. Might be missing due to historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$UserNameLogInfo;
//   }

//   declare interface DropboxTypes$team_log$MemberChangeNameType {
//     description: string;
//   }

//   /**
//   * Changed member status (invited, joined, suspended, etc.).
//   */
//   declare interface DropboxTypes$team_log$MemberChangeStatusDetails {
//     /**
//     * Previous member status. Might be missing due to historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$MemberStatus;

//     /**
//     * New member status.
//     */
//     new_value: DropboxTypes$team_log$MemberStatus;

//     /**
//     * Additional information indicating the action taken that caused status
//     * change.
//     */
//     action?: DropboxTypes$team_log$ActionDetails;
//   }

//   declare interface DropboxTypes$team_log$MemberChangeStatusType {
//     description: string;
//   }

//   /**
//   * Cleared manually added contacts.
//   */
//   declare interface DropboxTypes$team_log$MemberDeleteManualContactsDetails {}

//   declare interface DropboxTypes$team_log$MemberDeleteManualContactsType {
//     description: string;
//   }

//   /**
//   * Permanently deleted contents of deleted team member account.
//   */
//   declare interface DropboxTypes$team_log$MemberPermanentlyDeleteAccountContentsDetails {}

//   declare interface DropboxTypes$team_log$MemberPermanentlyDeleteAccountContentsType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$MemberRemoveActionTypeDelete {
//     ".tag": "delete";
//   }

//   declare interface DropboxTypes$team_log$MemberRemoveActionTypeOffboard {
//     ".tag": "offboard";
//   }

//   declare interface DropboxTypes$team_log$MemberRemoveActionTypeLeave {
//     ".tag": "leave";
//   }

//   declare interface DropboxTypes$team_log$MemberRemoveActionTypeOffboardAndRetainTeamFolders {
//     ".tag": "offboard_and_retain_team_folders";
//   }

//   declare interface DropboxTypes$team_log$MemberRemoveActionTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$MemberRemoveActionType =
//     | DropboxTypes$team_log$MemberRemoveActionTypeDelete
//     | DropboxTypes$team_log$MemberRemoveActionTypeOffboard
//     | DropboxTypes$team_log$MemberRemoveActionTypeLeave
//     | DropboxTypes$team_log$MemberRemoveActionTypeOffboardAndRetainTeamFolders
//     | DropboxTypes$team_log$MemberRemoveActionTypeOther;

//   /**
//   * Removed the external ID for team member.
//   */
//   declare interface DropboxTypes$team_log$MemberRemoveExternalIdDetails {
//     /**
//     * Old external id.
//     */
//     previous_value: DropboxTypes$team_common$MemberExternalId;
//   }

//   declare interface DropboxTypes$team_log$MemberRemoveExternalIdType {
//     description: string;
//   }

//   /**
//   * Changed whether users can find team when not invited.
//   */
//   declare interface DropboxTypes$team_log$MemberRequestsChangePolicyDetails {
//     /**
//     * New member change requests policy.
//     */
//     new_value: DropboxTypes$team_log$MemberRequestsPolicy;

//     /**
//     * Previous member change requests policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$MemberRequestsPolicy;
//   }

//   declare interface DropboxTypes$team_log$MemberRequestsChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$MemberRequestsPolicyAutoAccept {
//     ".tag": "auto_accept";
//   }

//   declare interface DropboxTypes$team_log$MemberRequestsPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$MemberRequestsPolicyRequireApproval {
//     ".tag": "require_approval";
//   }

//   declare interface DropboxTypes$team_log$MemberRequestsPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$MemberRequestsPolicy =
//     | DropboxTypes$team_log$MemberRequestsPolicyAutoAccept
//     | DropboxTypes$team_log$MemberRequestsPolicyDisabled
//     | DropboxTypes$team_log$MemberRequestsPolicyRequireApproval
//     | DropboxTypes$team_log$MemberRequestsPolicyOther;

//   /**
//   * Set custom member space limit.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsAddCustomQuotaDetails {
//     /**
//     * New custom quota value in bytes.
//     */
//     new_value: number;
//   }

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsAddCustomQuotaType {
//     description: string;
//   }

//   /**
//   * Added members to member space limit exception list.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsAddExceptionDetails {}

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsAddExceptionType {
//     description: string;
//   }

//   /**
//   * Changed member space limit type for team.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangeCapsTypePolicyDetails {
//     /**
//     * Previous space limit type.
//     */
//     previous_value: DropboxTypes$team_log$SpaceCapsType;

//     /**
//     * New space limit type.
//     */
//     new_value: DropboxTypes$team_log$SpaceCapsType;
//   }

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangeCapsTypePolicyType {
//     description: string;
//   }

//   /**
//   * Changed custom member space limit.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangeCustomQuotaDetails {
//     /**
//     * Previous custom quota value in bytes.
//     */
//     previous_value: number;

//     /**
//     * New custom quota value in bytes.
//     */
//     new_value: number;
//   }

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangeCustomQuotaType {
//     description: string;
//   }

//   /**
//   * Changed team default member space limit.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangePolicyDetails {
//     /**
//     * Previous team default limit value in bytes. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: number;

//     /**
//     * New team default limit value in bytes. Might be missing due to
//     * historical data gap.
//     */
//     new_value?: number;
//   }

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangePolicyType {
//     description: string;
//   }

//   /**
//   * Changed space limit status.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangeStatusDetails {
//     /**
//     * Previous storage quota status.
//     */
//     previous_value: DropboxTypes$team_log$SpaceLimitsStatus;

//     /**
//     * New storage quota status.
//     */
//     new_value: DropboxTypes$team_log$SpaceLimitsStatus;
//   }

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsChangeStatusType {
//     description: string;
//   }

//   /**
//   * Removed custom member space limit.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsRemoveCustomQuotaDetails {}

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsRemoveCustomQuotaType {
//     description: string;
//   }

//   /**
//   * Removed members from member space limit exception list.
//   */
//   declare interface DropboxTypes$team_log$MemberSpaceLimitsRemoveExceptionDetails {}

//   declare interface DropboxTypes$team_log$MemberSpaceLimitsRemoveExceptionType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$MemberStatusNotJoined {
//     ".tag": "not_joined";
//   }

//   declare interface DropboxTypes$team_log$MemberStatusInvited {
//     ".tag": "invited";
//   }

//   declare interface DropboxTypes$team_log$MemberStatusActive {
//     ".tag": "active";
//   }

//   declare interface DropboxTypes$team_log$MemberStatusSuspended {
//     ".tag": "suspended";
//   }

//   declare interface DropboxTypes$team_log$MemberStatusRemoved {
//     ".tag": "removed";
//   }

//   declare interface DropboxTypes$team_log$MemberStatusOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$MemberStatus =
//     | DropboxTypes$team_log$MemberStatusNotJoined
//     | DropboxTypes$team_log$MemberStatusInvited
//     | DropboxTypes$team_log$MemberStatusActive
//     | DropboxTypes$team_log$MemberStatusSuspended
//     | DropboxTypes$team_log$MemberStatusRemoved
//     | DropboxTypes$team_log$MemberStatusOther;

//   /**
//   * Suggested person to add to team.
//   */
//   declare interface DropboxTypes$team_log$MemberSuggestDetails {
//     /**
//     * suggested users emails.
//     */
//     suggested_members: Array<DropboxTypes$team_log$EmailAddress>;
//   }

//   declare interface DropboxTypes$team_log$MemberSuggestType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled option for team members to suggest people to add to
//   * team.
//   */
//   declare interface DropboxTypes$team_log$MemberSuggestionsChangePolicyDetails {
//     /**
//     * New team member suggestions policy.
//     */
//     new_value: DropboxTypes$team_log$MemberSuggestionsPolicy;

//     /**
//     * Previous team member suggestions policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$MemberSuggestionsPolicy;
//   }

//   declare interface DropboxTypes$team_log$MemberSuggestionsChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$MemberSuggestionsPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$MemberSuggestionsPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$MemberSuggestionsPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Member suggestions policy
//   */
//   declare type DropboxTypes$team_log$MemberSuggestionsPolicy =
//     | DropboxTypes$team_log$MemberSuggestionsPolicyDisabled
//     | DropboxTypes$team_log$MemberSuggestionsPolicyEnabled
//     | DropboxTypes$team_log$MemberSuggestionsPolicyOther;

//   /**
//   * Transferred contents of deleted member account to another member.
//   */
//   declare interface DropboxTypes$team_log$MemberTransferAccountContentsDetails {}

//   declare interface DropboxTypes$team_log$MemberTransferAccountContentsType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled Microsoft Office add-in.
//   */
//   declare interface DropboxTypes$team_log$MicrosoftOfficeAddinChangePolicyDetails {
//     /**
//     * New Microsoft Office addin policy.
//     */
//     new_value: DropboxTypes$team_log$MicrosoftOfficeAddinPolicy;

//     /**
//     * Previous Microsoft Office addin policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$MicrosoftOfficeAddinPolicy;
//   }

//   declare interface DropboxTypes$team_log$MicrosoftOfficeAddinChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$MicrosoftOfficeAddinPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$MicrosoftOfficeAddinPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$MicrosoftOfficeAddinPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Microsoft Office addin policy
//   */
//   declare type DropboxTypes$team_log$MicrosoftOfficeAddinPolicy =
//     | DropboxTypes$team_log$MicrosoftOfficeAddinPolicyDisabled
//     | DropboxTypes$team_log$MicrosoftOfficeAddinPolicyEnabled
//     | DropboxTypes$team_log$MicrosoftOfficeAddinPolicyOther;

//   /**
//   * An indication that an error occurred while retrieving the event. Some
//   * attributes of the event may be omitted as a result.
//   */
//   declare interface DropboxTypes$team_log$MissingDetails {
//     /**
//     * All the data that could be retrieved and converted from the source
//     * event.
//     */
//     source_event_fields?: string;
//   }

//   /**
//   * Information about linked Dropbox mobile client sessions
//   */
//   declare type DropboxTypes$team_log$MobileDeviceSessionLogInfo = {
//     /**
//     * Mobile session unique id. Might be missing due to historical data gap.
//     */
//     session_info?: DropboxTypes$team_log$MobileSessionLogInfo,

//     /**
//     * The device name.
//     */
//     device_name: string,

//     /**
//     * The mobile application type.
//     */
//     client_type: DropboxTypes$team$MobileClientPlatform,

//     /**
//     * The Dropbox client version.
//     */
//     client_version?: string,

//     /**
//     * The hosting OS version.
//     */
//     os_version?: string,

//     /**
//     * last carrier used by the device.
//     */
//     last_carrier?: string,
//     ...
//   } & DropboxTypes$team_log$DeviceSessionLogInfo;

//   /**
//   * Reference to the MobileDeviceSessionLogInfo type, identified by the value
//   * of the .tag property.
//   */
//   declare type DropboxTypes$team_log$MobileDeviceSessionLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "mobile_device_session",
//     ...
//   } & DropboxTypes$team_log$MobileDeviceSessionLogInfo;

//   /**
//   * Mobile session.
//   */
//   declare type DropboxTypes$team_log$MobileSessionLogInfo = {
//     ...
//   } & DropboxTypes$team_log$SessionLogInfo;

//   /**
//   * Reference to the MobileSessionLogInfo type, identified by the value of
//   * the .tag property.
//   */
//   declare type DropboxTypes$team_log$MobileSessionLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "mobile",
//     ...
//   } & DropboxTypes$team_log$MobileSessionLogInfo;

//   /**
//   * Namespace relative path details.
//   */
//   declare interface DropboxTypes$team_log$NamespaceRelativePathLogInfo {
//     /**
//     * Namespace ID. Might be missing due to historical data gap.
//     */
//     ns_id?: DropboxTypes$team_log$NamespaceId;

//     /**
//     * A path relative to the specified namespace ID. Might be missing due to
//     * historical data gap.
//     */
//     relative_path?: DropboxTypes$team_log$FilePath;
//   }

//   /**
//   * Enabled/disabled network control.
//   */
//   declare interface DropboxTypes$team_log$NetworkControlChangePolicyDetails {
//     /**
//     * New network control policy.
//     */
//     new_value: DropboxTypes$team_log$NetworkControlPolicy;

//     /**
//     * Previous network control policy. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$team_log$NetworkControlPolicy;
//   }

//   declare interface DropboxTypes$team_log$NetworkControlChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$NetworkControlPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$NetworkControlPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$NetworkControlPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Network control policy
//   */
//   declare type DropboxTypes$team_log$NetworkControlPolicy =
//     | DropboxTypes$team_log$NetworkControlPolicyDisabled
//     | DropboxTypes$team_log$NetworkControlPolicyEnabled
//     | DropboxTypes$team_log$NetworkControlPolicyOther;

//   /**
//   * Non team member's logged information.
//   */
//   declare type DropboxTypes$team_log$NonTeamMemberLogInfo = {
//     ...
//   } & DropboxTypes$team_log$UserLogInfo;

//   /**
//   * Reference to the NonTeamMemberLogInfo type, identified by the value of
//   * the .tag property.
//   */
//   declare type DropboxTypes$team_log$NonTeamMemberLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "non_team_member",
//     ...
//   } & DropboxTypes$team_log$NonTeamMemberLogInfo;

//   /**
//   * Changed Paper doc to invite-only.
//   */
//   declare interface DropboxTypes$team_log$NoteAclInviteOnlyDetails {}

//   declare interface DropboxTypes$team_log$NoteAclInviteOnlyType {
//     description: string;
//   }

//   /**
//   * Changed Paper doc to link-accessible.
//   */
//   declare interface DropboxTypes$team_log$NoteAclLinkDetails {}

//   declare interface DropboxTypes$team_log$NoteAclLinkType {
//     description: string;
//   }

//   /**
//   * Changed Paper doc to link-accessible for team.
//   */
//   declare interface DropboxTypes$team_log$NoteAclTeamLinkDetails {}

//   declare interface DropboxTypes$team_log$NoteAclTeamLinkType {
//     description: string;
//   }

//   /**
//   * Shared received Paper doc.
//   */
//   declare interface DropboxTypes$team_log$NoteShareReceiveDetails {}

//   declare interface DropboxTypes$team_log$NoteShareReceiveType {
//     description: string;
//   }

//   /**
//   * Shared Paper doc.
//   */
//   declare interface DropboxTypes$team_log$NoteSharedDetails {}

//   declare interface DropboxTypes$team_log$NoteSharedType {
//     description: string;
//   }

//   /**
//   * Opened shared Paper doc.
//   */
//   declare interface DropboxTypes$team_log$OpenNoteSharedDetails {}

//   declare interface DropboxTypes$team_log$OpenNoteSharedType {
//     description: string;
//   }

//   /**
//   * The origin from which the actor performed the action.
//   */
//   declare interface DropboxTypes$team_log$OriginLogInfo {
//     /**
//     * Geographic location details.
//     */
//     geo_location?: DropboxTypes$team_log$GeoLocationLogInfo;

//     /**
//     * The method that was used to perform the action.
//     */
//     access_method: DropboxTypes$team_log$AccessMethodLogInfo;
//   }

//   declare interface DropboxTypes$team_log$PaperAccessTypeViewer {
//     ".tag": "viewer";
//   }

//   declare interface DropboxTypes$team_log$PaperAccessTypeCommenter {
//     ".tag": "commenter";
//   }

//   declare interface DropboxTypes$team_log$PaperAccessTypeEditor {
//     ".tag": "editor";
//   }

//   declare interface DropboxTypes$team_log$PaperAccessTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$PaperAccessType =
//     | DropboxTypes$team_log$PaperAccessTypeViewer
//     | DropboxTypes$team_log$PaperAccessTypeCommenter
//     | DropboxTypes$team_log$PaperAccessTypeEditor
//     | DropboxTypes$team_log$PaperAccessTypeOther;

//   /**
//   * Exported all team Paper docs.
//   */
//   declare interface DropboxTypes$team_log$PaperAdminExportStartDetails {}

//   declare interface DropboxTypes$team_log$PaperAdminExportStartType {
//     description: string;
//   }

//   /**
//   * Changed whether Dropbox Paper, when enabled, is deployed to all members
//   * or to specific members.
//   */
//   declare interface DropboxTypes$team_log$PaperChangeDeploymentPolicyDetails {
//     /**
//     * New Dropbox Paper deployment policy.
//     */
//     new_value: DropboxTypes$team_policies$PaperDeploymentPolicy;

//     /**
//     * Previous Dropbox Paper deployment policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_policies$PaperDeploymentPolicy;
//   }

//   declare interface DropboxTypes$team_log$PaperChangeDeploymentPolicyType {
//     description: string;
//   }

//   /**
//   * Changed whether non-members can view Paper docs with link.
//   */
//   declare interface DropboxTypes$team_log$PaperChangeMemberLinkPolicyDetails {
//     /**
//     * New paper external link accessibility policy.
//     */
//     new_value: DropboxTypes$team_log$PaperMemberPolicy;
//   }

//   declare interface DropboxTypes$team_log$PaperChangeMemberLinkPolicyType {
//     description: string;
//   }

//   /**
//   * Changed whether members can share Paper docs outside team, and if docs
//   * are accessible only by team members or anyone by default.
//   */
//   declare interface DropboxTypes$team_log$PaperChangeMemberPolicyDetails {
//     /**
//     * New paper external accessibility policy.
//     */
//     new_value: DropboxTypes$team_log$PaperMemberPolicy;

//     /**
//     * Previous paper external accessibility policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$PaperMemberPolicy;
//   }

//   declare interface DropboxTypes$team_log$PaperChangeMemberPolicyType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled Dropbox Paper for team.
//   */
//   declare interface DropboxTypes$team_log$PaperChangePolicyDetails {
//     /**
//     * New Dropbox Paper policy.
//     */
//     new_value: DropboxTypes$team_policies$PaperEnabledPolicy;

//     /**
//     * Previous Dropbox Paper policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_policies$PaperEnabledPolicy;
//   }

//   declare interface DropboxTypes$team_log$PaperChangePolicyType {
//     description: string;
//   }

//   /**
//   * Added team member to Paper doc/folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentAddMemberDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperContentAddMemberType {
//     description: string;
//   }

//   /**
//   * Added Paper doc/folder to folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentAddToFolderDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Parent asset position in the Assets list.
//     */
//     parent_asset_index: number;
//   }

//   declare interface DropboxTypes$team_log$PaperContentAddToFolderType {
//     description: string;
//   }

//   /**
//   * Archived Paper doc/folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentArchiveDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperContentArchiveType {
//     description: string;
//   }

//   /**
//   * Created Paper doc/folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentCreateDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperContentCreateType {
//     description: string;
//   }

//   /**
//   * Permanently deleted Paper doc/folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentPermanentlyDeleteDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperContentPermanentlyDeleteType {
//     description: string;
//   }

//   /**
//   * Removed Paper doc/folder from folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentRemoveFromFolderDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Parent asset position in the Assets list.
//     */
//     parent_asset_index: number;
//   }

//   declare interface DropboxTypes$team_log$PaperContentRemoveFromFolderType {
//     description: string;
//   }

//   /**
//   * Removed team member from Paper doc/folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentRemoveMemberDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperContentRemoveMemberType {
//     description: string;
//   }

//   /**
//   * Renamed Paper doc/folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentRenameDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperContentRenameType {
//     description: string;
//   }

//   /**
//   * Restored archived Paper doc/folder.
//   */
//   declare interface DropboxTypes$team_log$PaperContentRestoreDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperContentRestoreType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDefaultFolderPolicyEveryoneInTeam {
//     ".tag": "everyone_in_team";
//   }

//   declare interface DropboxTypes$team_log$PaperDefaultFolderPolicyInviteOnly {
//     ".tag": "invite_only";
//   }

//   declare interface DropboxTypes$team_log$PaperDefaultFolderPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy to set default access for newly created Paper folders.
//   */
//   declare type DropboxTypes$team_log$PaperDefaultFolderPolicy =
//     | DropboxTypes$team_log$PaperDefaultFolderPolicyEveryoneInTeam
//     | DropboxTypes$team_log$PaperDefaultFolderPolicyInviteOnly
//     | DropboxTypes$team_log$PaperDefaultFolderPolicyOther;

//   /**
//   * Changed Paper Default Folder Policy setting for team.
//   */
//   declare interface DropboxTypes$team_log$PaperDefaultFolderPolicyChangedDetails {
//     /**
//     * New Paper Default Folder Policy.
//     */
//     new_value: DropboxTypes$team_log$PaperDefaultFolderPolicy;

//     /**
//     * Previous Paper Default Folder Policy.
//     */
//     previous_value: DropboxTypes$team_log$PaperDefaultFolderPolicy;
//   }

//   declare interface DropboxTypes$team_log$PaperDefaultFolderPolicyChangedType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDesktopPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$PaperDesktopPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$PaperDesktopPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if team members can use Paper Desktop
//   */
//   declare type DropboxTypes$team_log$PaperDesktopPolicy =
//     | DropboxTypes$team_log$PaperDesktopPolicyDisabled
//     | DropboxTypes$team_log$PaperDesktopPolicyEnabled
//     | DropboxTypes$team_log$PaperDesktopPolicyOther;

//   /**
//   * Enabled/disabled Paper Desktop for team.
//   */
//   declare interface DropboxTypes$team_log$PaperDesktopPolicyChangedDetails {
//     /**
//     * New Paper Desktop policy.
//     */
//     new_value: DropboxTypes$team_log$PaperDesktopPolicy;

//     /**
//     * Previous Paper Desktop policy.
//     */
//     previous_value: DropboxTypes$team_log$PaperDesktopPolicy;
//   }

//   declare interface DropboxTypes$team_log$PaperDesktopPolicyChangedType {
//     description: string;
//   }

//   /**
//   * Added Paper doc comment.
//   */
//   declare interface DropboxTypes$team_log$PaperDocAddCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocAddCommentType {
//     description: string;
//   }

//   /**
//   * Changed team member permissions for Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocChangeMemberRoleDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Paper doc access type.
//     */
//     access_type: DropboxTypes$team_log$PaperAccessType;
//   }

//   declare interface DropboxTypes$team_log$PaperDocChangeMemberRoleType {
//     description: string;
//   }

//   /**
//   * Changed sharing setting for Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocChangeSharingPolicyDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Sharing policy with external users. Might be missing due to historical
//     * data gap.
//     */
//     public_sharing_policy?: string;

//     /**
//     * Sharing policy with team. Might be missing due to historical data gap.
//     */
//     team_sharing_policy?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocChangeSharingPolicyType {
//     description: string;
//   }

//   /**
//   * Followed/unfollowed Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocChangeSubscriptionDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * New doc subscription level.
//     */
//     new_subscription_level: string;

//     /**
//     * Previous doc subscription level. Might be missing due to historical
//     * data gap.
//     */
//     previous_subscription_level?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocChangeSubscriptionType {
//     description: string;
//   }

//   /**
//   * Deleted Paper doc comment.
//   */
//   declare interface DropboxTypes$team_log$PaperDocDeleteCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocDeleteCommentType {
//     description: string;
//   }

//   /**
//   * Archived Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocDeletedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocDeletedType {
//     description: string;
//   }

//   /**
//   * Downloaded Paper doc in specific format.
//   */
//   declare interface DropboxTypes$team_log$PaperDocDownloadDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Export file format.
//     */
//     export_file_format: DropboxTypes$team_log$PaperDownloadFormat;
//   }

//   declare interface DropboxTypes$team_log$PaperDocDownloadType {
//     description: string;
//   }

//   /**
//   * Edited Paper doc comment.
//   */
//   declare interface DropboxTypes$team_log$PaperDocEditCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocEditCommentType {
//     description: string;
//   }

//   /**
//   * Edited Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocEditDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocEditType {
//     description: string;
//   }

//   /**
//   * Followed Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocFollowedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocFollowedType {
//     description: string;
//   }

//   /**
//   * Mentioned team member in Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocMentionDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocMentionType {
//     description: string;
//   }

//   /**
//   * Transferred ownership of Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocOwnershipChangedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Previous owner.
//     */
//     old_owner_user_id?: DropboxTypes$users_common$AccountId;

//     /**
//     * New owner.
//     */
//     new_owner_user_id: DropboxTypes$users_common$AccountId;
//   }

//   declare interface DropboxTypes$team_log$PaperDocOwnershipChangedType {
//     description: string;
//   }

//   /**
//   * Requested access to Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocRequestAccessDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocRequestAccessType {
//     description: string;
//   }

//   /**
//   * Resolved Paper doc comment.
//   */
//   declare interface DropboxTypes$team_log$PaperDocResolveCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocResolveCommentType {
//     description: string;
//   }

//   /**
//   * Restored Paper doc to previous version.
//   */
//   declare interface DropboxTypes$team_log$PaperDocRevertDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocRevertType {
//     description: string;
//   }

//   /**
//   * Shared Paper doc via Slack.
//   */
//   declare interface DropboxTypes$team_log$PaperDocSlackShareDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocSlackShareType {
//     description: string;
//   }

//   /**
//   * Shared Paper doc with team member.
//   */
//   declare interface DropboxTypes$team_log$PaperDocTeamInviteDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocTeamInviteType {
//     description: string;
//   }

//   /**
//   * Deleted Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocTrashedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocTrashedType {
//     description: string;
//   }

//   /**
//   * Unresolved Paper doc comment.
//   */
//   declare interface DropboxTypes$team_log$PaperDocUnresolveCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text. Might be missing due to historical data gap.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocUnresolveCommentType {
//     description: string;
//   }

//   /**
//   * Restored Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocUntrashedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocUntrashedType {
//     description: string;
//   }

//   /**
//   * Viewed Paper doc.
//   */
//   declare interface DropboxTypes$team_log$PaperDocViewDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDocViewType {
//     description: string;
//   }

//   /**
//   * Paper document's logged information.
//   */
//   declare interface DropboxTypes$team_log$PaperDocumentLogInfo {
//     /**
//     * Papers document Id.
//     */
//     doc_id: string;

//     /**
//     * Paper document title.
//     */
//     doc_title: string;
//   }

//   declare interface DropboxTypes$team_log$PaperDownloadFormatDocx {
//     ".tag": "docx";
//   }

//   declare interface DropboxTypes$team_log$PaperDownloadFormatHtml {
//     ".tag": "html";
//   }

//   declare interface DropboxTypes$team_log$PaperDownloadFormatMarkdown {
//     ".tag": "markdown";
//   }

//   declare interface DropboxTypes$team_log$PaperDownloadFormatPdf {
//     ".tag": "pdf";
//   }

//   declare interface DropboxTypes$team_log$PaperDownloadFormatOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$PaperDownloadFormat =
//     | DropboxTypes$team_log$PaperDownloadFormatDocx
//     | DropboxTypes$team_log$PaperDownloadFormatHtml
//     | DropboxTypes$team_log$PaperDownloadFormatMarkdown
//     | DropboxTypes$team_log$PaperDownloadFormatPdf
//     | DropboxTypes$team_log$PaperDownloadFormatOther;

//   /**
//   * Added users to Paper-enabled users list.
//   */
//   declare interface DropboxTypes$team_log$PaperEnabledUsersGroupAdditionDetails {}

//   declare interface DropboxTypes$team_log$PaperEnabledUsersGroupAdditionType {
//     description: string;
//   }

//   /**
//   * Removed users from Paper-enabled users list.
//   */
//   declare interface DropboxTypes$team_log$PaperEnabledUsersGroupRemovalDetails {}

//   declare interface DropboxTypes$team_log$PaperEnabledUsersGroupRemovalType {
//     description: string;
//   }

//   /**
//   * Changed Paper external sharing setting to anyone.
//   */
//   declare interface DropboxTypes$team_log$PaperExternalViewAllowDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperExternalViewAllowType {
//     description: string;
//   }

//   /**
//   * Changed Paper external sharing setting to default team.
//   */
//   declare interface DropboxTypes$team_log$PaperExternalViewDefaultTeamDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperExternalViewDefaultTeamType {
//     description: string;
//   }

//   /**
//   * Changed Paper external sharing setting to team-only.
//   */
//   declare interface DropboxTypes$team_log$PaperExternalViewForbidDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperExternalViewForbidType {
//     description: string;
//   }

//   /**
//   * Followed/unfollowed Paper folder.
//   */
//   declare interface DropboxTypes$team_log$PaperFolderChangeSubscriptionDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * New folder subscription level.
//     */
//     new_subscription_level: string;

//     /**
//     * Previous folder subscription level. Might be missing due to historical
//     * data gap.
//     */
//     previous_subscription_level?: string;
//   }

//   declare interface DropboxTypes$team_log$PaperFolderChangeSubscriptionType {
//     description: string;
//   }

//   /**
//   * Archived Paper folder.
//   */
//   declare interface DropboxTypes$team_log$PaperFolderDeletedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperFolderDeletedType {
//     description: string;
//   }

//   /**
//   * Followed Paper folder.
//   */
//   declare interface DropboxTypes$team_log$PaperFolderFollowedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperFolderFollowedType {
//     description: string;
//   }

//   /**
//   * Paper folder's logged information.
//   */
//   declare interface DropboxTypes$team_log$PaperFolderLogInfo {
//     /**
//     * Papers folder Id.
//     */
//     folder_id: string;

//     /**
//     * Paper folder name.
//     */
//     folder_name: string;
//   }

//   /**
//   * Shared Paper folder with member.
//   */
//   declare interface DropboxTypes$team_log$PaperFolderTeamInviteDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperFolderTeamInviteType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$PaperMemberPolicyAnyoneWithLink {
//     ".tag": "anyone_with_link";
//   }

//   declare interface DropboxTypes$team_log$PaperMemberPolicyOnlyTeam {
//     ".tag": "only_team";
//   }

//   declare interface DropboxTypes$team_log$PaperMemberPolicyTeamAndExplicitlyShared {
//     ".tag": "team_and_explicitly_shared";
//   }

//   declare interface DropboxTypes$team_log$PaperMemberPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if team members can share Paper documents
//   * externally.
//   */
//   declare type DropboxTypes$team_log$PaperMemberPolicy =
//     | DropboxTypes$team_log$PaperMemberPolicyAnyoneWithLink
//     | DropboxTypes$team_log$PaperMemberPolicyOnlyTeam
//     | DropboxTypes$team_log$PaperMemberPolicyTeamAndExplicitlyShared
//     | DropboxTypes$team_log$PaperMemberPolicyOther;

//   /**
//   * Published doc.
//   */
//   declare interface DropboxTypes$team_log$PaperPublishedLinkCreateDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperPublishedLinkCreateType {
//     description: string;
//   }

//   /**
//   * Unpublished doc.
//   */
//   declare interface DropboxTypes$team_log$PaperPublishedLinkDisabledDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperPublishedLinkDisabledType {
//     description: string;
//   }

//   /**
//   * Viewed published doc.
//   */
//   declare interface DropboxTypes$team_log$PaperPublishedLinkViewDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$PaperPublishedLinkViewType {
//     description: string;
//   }

//   /**
//   * A user with a Dropbox account.
//   */
//   declare interface DropboxTypes$team_log$ParticipantLogInfoUser {
//     ".tag": "user";
//     user:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;
//   }

//   /**
//   * Group details.
//   */
//   declare type DropboxTypes$team_log$ParticipantLogInfoGroup = {
//     ".tag": "group",
//     ...
//   } & DropboxTypes$team_log$GroupLogInfo;

//   declare interface DropboxTypes$team_log$ParticipantLogInfoOther {
//     ".tag": "other";
//   }

//   /**
//   * A user or group
//   */
//   declare type DropboxTypes$team_log$ParticipantLogInfo =
//     | DropboxTypes$team_log$ParticipantLogInfoUser
//     | DropboxTypes$team_log$ParticipantLogInfoGroup
//     | DropboxTypes$team_log$ParticipantLogInfoOther;

//   declare interface DropboxTypes$team_log$PassPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$PassPolicyAllow {
//     ".tag": "allow";
//   }

//   declare interface DropboxTypes$team_log$PassPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$PassPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$PassPolicy =
//     | DropboxTypes$team_log$PassPolicyEnabled
//     | DropboxTypes$team_log$PassPolicyAllow
//     | DropboxTypes$team_log$PassPolicyDisabled
//     | DropboxTypes$team_log$PassPolicyOther;

//   /**
//   * Changed password.
//   */
//   declare interface DropboxTypes$team_log$PasswordChangeDetails {}

//   declare interface DropboxTypes$team_log$PasswordChangeType {
//     description: string;
//   }

//   /**
//   * Reset all team member passwords.
//   */
//   declare interface DropboxTypes$team_log$PasswordResetAllDetails {}

//   declare interface DropboxTypes$team_log$PasswordResetAllType {
//     description: string;
//   }

//   /**
//   * Reset password.
//   */
//   declare interface DropboxTypes$team_log$PasswordResetDetails {}

//   declare interface DropboxTypes$team_log$PasswordResetType {
//     description: string;
//   }

//   /**
//   * Path's details.
//   */
//   declare interface DropboxTypes$team_log$PathLogInfo {
//     /**
//     * Fully qualified path relative to event's context. Might be missing due
//     * to historical data gap.
//     */
//     contextual?: DropboxTypes$team_log$FilePath;

//     /**
//     * Path relative to the namespace containing the content.
//     */
//     namespace_relative: DropboxTypes$team_log$NamespaceRelativePathLogInfo;
//   }

//   /**
//   * Enabled/disabled ability of team members to permanently delete content.
//   */
//   declare interface DropboxTypes$team_log$PermanentDeleteChangePolicyDetails {
//     /**
//     * New permanent delete content policy.
//     */
//     new_value: DropboxTypes$team_log$ContentPermanentDeletePolicy;

//     /**
//     * Previous permanent delete content policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$ContentPermanentDeletePolicy;
//   }

//   declare interface DropboxTypes$team_log$PermanentDeleteChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$PlacementRestrictionAustraliaOnly {
//     ".tag": "australia_only";
//   }

//   declare interface DropboxTypes$team_log$PlacementRestrictionEuropeOnly {
//     ".tag": "europe_only";
//   }

//   declare interface DropboxTypes$team_log$PlacementRestrictionJapanOnly {
//     ".tag": "japan_only";
//   }

//   declare interface DropboxTypes$team_log$PlacementRestrictionNone {
//     ".tag": "none";
//   }

//   declare interface DropboxTypes$team_log$PlacementRestrictionOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$PlacementRestriction =
//     | DropboxTypes$team_log$PlacementRestrictionAustraliaOnly
//     | DropboxTypes$team_log$PlacementRestrictionEuropeOnly
//     | DropboxTypes$team_log$PlacementRestrictionJapanOnly
//     | DropboxTypes$team_log$PlacementRestrictionNone
//     | DropboxTypes$team_log$PlacementRestrictionOther;

//   /**
//   * Team merge request acceptance details shown to the primary team
//   */
//   declare interface DropboxTypes$team_log$PrimaryTeamRequestAcceptedDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   /**
//   * Team merge request cancellation details shown to the primary team
//   */
//   declare interface DropboxTypes$team_log$PrimaryTeamRequestCanceledDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   /**
//   * Team merge request expiration details shown to the primary team
//   */
//   declare interface DropboxTypes$team_log$PrimaryTeamRequestExpiredDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   /**
//   * Team merge request reminder details shown to the primary team
//   */
//   declare interface DropboxTypes$team_log$PrimaryTeamRequestReminderDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   declare interface DropboxTypes$team_log$QuickActionTypeDeleteSharedLink {
//     ".tag": "delete_shared_link";
//   }

//   declare interface DropboxTypes$team_log$QuickActionTypeResetPassword {
//     ".tag": "reset_password";
//   }

//   declare interface DropboxTypes$team_log$QuickActionTypeRestoreFileOrFolder {
//     ".tag": "restore_file_or_folder";
//   }

//   declare interface DropboxTypes$team_log$QuickActionTypeUnlinkApp {
//     ".tag": "unlink_app";
//   }

//   declare interface DropboxTypes$team_log$QuickActionTypeUnlinkSession {
//     ".tag": "unlink_session";
//   }

//   declare interface DropboxTypes$team_log$QuickActionTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * Quick action type.
//   */
//   declare type DropboxTypes$team_log$QuickActionType =
//     | DropboxTypes$team_log$QuickActionTypeDeleteSharedLink
//     | DropboxTypes$team_log$QuickActionTypeResetPassword
//     | DropboxTypes$team_log$QuickActionTypeRestoreFileOrFolder
//     | DropboxTypes$team_log$QuickActionTypeUnlinkApp
//     | DropboxTypes$team_log$QuickActionTypeUnlinkSession
//     | DropboxTypes$team_log$QuickActionTypeOther;

//   /**
//   * Provides the indices of the source asset and the destination asset for a
//   * relocate action.
//   */
//   declare interface DropboxTypes$team_log$RelocateAssetReferencesLogInfo {
//     /**
//     * Source asset position in the Assets list.
//     */
//     src_asset_index: number;

//     /**
//     * Destination asset position in the Assets list.
//     */
//     dest_asset_index: number;
//   }

//   /**
//   * Reseller information.
//   */
//   declare interface DropboxTypes$team_log$ResellerLogInfo {
//     /**
//     * Reseller name.
//     */
//     reseller_name: string;

//     /**
//     * Reseller email.
//     */
//     reseller_email: DropboxTypes$team_log$EmailAddress;
//   }

//   /**
//   * Enabled/disabled reseller support.
//   */
//   declare interface DropboxTypes$team_log$ResellerSupportChangePolicyDetails {
//     /**
//     * New Reseller support policy.
//     */
//     new_value: DropboxTypes$team_log$ResellerSupportPolicy;

//     /**
//     * Previous Reseller support policy.
//     */
//     previous_value: DropboxTypes$team_log$ResellerSupportPolicy;
//   }

//   declare interface DropboxTypes$team_log$ResellerSupportChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$ResellerSupportPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$ResellerSupportPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$ResellerSupportPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if reseller can access the admin console as
//   * administrator
//   */
//   declare type DropboxTypes$team_log$ResellerSupportPolicy =
//     | DropboxTypes$team_log$ResellerSupportPolicyDisabled
//     | DropboxTypes$team_log$ResellerSupportPolicyEnabled
//     | DropboxTypes$team_log$ResellerSupportPolicyOther;

//   /**
//   * Ended reseller support session.
//   */
//   declare interface DropboxTypes$team_log$ResellerSupportSessionEndDetails {}

//   declare interface DropboxTypes$team_log$ResellerSupportSessionEndType {
//     description: string;
//   }

//   /**
//   * Started reseller support session.
//   */
//   declare interface DropboxTypes$team_log$ResellerSupportSessionStartDetails {}

//   declare interface DropboxTypes$team_log$ResellerSupportSessionStartType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$SecondaryMailsPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$SecondaryMailsPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$SecondaryMailsPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$SecondaryMailsPolicy =
//     | DropboxTypes$team_log$SecondaryMailsPolicyDisabled
//     | DropboxTypes$team_log$SecondaryMailsPolicyEnabled
//     | DropboxTypes$team_log$SecondaryMailsPolicyOther;

//   /**
//   * Secondary mails policy changed.
//   */
//   declare interface DropboxTypes$team_log$SecondaryMailsPolicyChangedDetails {
//     /**
//     * Previous secondary mails policy.
//     */
//     previous_value: DropboxTypes$team_log$SecondaryMailsPolicy;

//     /**
//     * New secondary mails policy.
//     */
//     new_value: DropboxTypes$team_log$SecondaryMailsPolicy;
//   }

//   declare interface DropboxTypes$team_log$SecondaryMailsPolicyChangedType {
//     description: string;
//   }

//   /**
//   * Team merge request acceptance details shown to the secondary team
//   */
//   declare interface DropboxTypes$team_log$SecondaryTeamRequestAcceptedDetails {
//     /**
//     * The primary team name.
//     */
//     primary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   /**
//   * Team merge request cancellation details shown to the secondary team
//   */
//   declare interface DropboxTypes$team_log$SecondaryTeamRequestCanceledDetails {
//     /**
//     * The email of the primary team admin that the request was sent to.
//     */
//     sent_to: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   /**
//   * Team merge request expiration details shown to the secondary team
//   */
//   declare interface DropboxTypes$team_log$SecondaryTeamRequestExpiredDetails {
//     /**
//     * The email of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   /**
//   * Team merge request reminder details shown to the secondary team
//   */
//   declare interface DropboxTypes$team_log$SecondaryTeamRequestReminderDetails {
//     /**
//     * The email of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   /**
//   * Session's logged information.
//   */
//   declare interface DropboxTypes$team_log$SessionLogInfo {
//     /**
//     * Session ID. Might be missing due to historical data gap.
//     */
//     session_id?: DropboxTypes$common$SessionId;
//   }

//   /**
//   * Reference to the SessionLogInfo polymorphic type. Contains a .tag
//   * property to let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$team_log$SessionLogInfoReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "web" | "desktop" | "mobile",
//     ...
//   } & DropboxTypes$team_log$SessionLogInfo;

//   /**
//   * Added team to shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfAddGroupDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * Sharing permission. Might be missing due to historical data gap.
//     */
//     sharing_permission?: string;

//     /**
//     * Team name.
//     */
//     team_name: string;
//   }

//   declare interface DropboxTypes$team_log$SfAddGroupType {
//     description: string;
//   }

//   /**
//   * Allowed non-collaborators to view links to files in shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfAllowNonMembersToViewSharedLinksDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * Shared folder type. Might be missing due to historical data gap.
//     */
//     shared_folder_type?: string;
//   }

//   declare interface DropboxTypes$team_log$SfAllowNonMembersToViewSharedLinksType {
//     description: string;
//   }

//   /**
//   * Set team members to see warning before sharing folders outside team.
//   */
//   declare interface DropboxTypes$team_log$SfExternalInviteWarnDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * New sharing permission. Might be missing due to historical data gap.
//     */
//     new_sharing_permission?: string;

//     /**
//     * Previous sharing permission. Might be missing due to historical data
//     * gap.
//     */
//     previous_sharing_permission?: string;
//   }

//   declare interface DropboxTypes$team_log$SfExternalInviteWarnType {
//     description: string;
//   }

//   /**
//   * Changed Facebook user's role in shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfFbInviteChangeRoleDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * Previous sharing permission. Might be missing due to historical data
//     * gap.
//     */
//     previous_sharing_permission?: string;

//     /**
//     * New sharing permission. Might be missing due to historical data gap.
//     */
//     new_sharing_permission?: string;
//   }

//   declare interface DropboxTypes$team_log$SfFbInviteChangeRoleType {
//     description: string;
//   }

//   /**
//   * Invited Facebook users to shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfFbInviteDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * Sharing permission. Might be missing due to historical data gap.
//     */
//     sharing_permission?: string;
//   }

//   declare interface DropboxTypes$team_log$SfFbInviteType {
//     description: string;
//   }

//   /**
//   * Uninvited Facebook user from shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfFbUninviteDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;
//   }

//   declare interface DropboxTypes$team_log$SfFbUninviteType {
//     description: string;
//   }

//   /**
//   * Invited group to shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfInviteGroupDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;
//   }

//   declare interface DropboxTypes$team_log$SfInviteGroupType {
//     description: string;
//   }

//   /**
//   * Granted access to shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfTeamGrantAccessDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;
//   }

//   declare interface DropboxTypes$team_log$SfTeamGrantAccessType {
//     description: string;
//   }

//   /**
//   * Changed team member's role in shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfTeamInviteChangeRoleDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * New sharing permission. Might be missing due to historical data gap.
//     */
//     new_sharing_permission?: string;

//     /**
//     * Previous sharing permission. Might be missing due to historical data
//     * gap.
//     */
//     previous_sharing_permission?: string;
//   }

//   declare interface DropboxTypes$team_log$SfTeamInviteChangeRoleType {
//     description: string;
//   }

//   /**
//   * Invited team members to shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfTeamInviteDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * Sharing permission. Might be missing due to historical data gap.
//     */
//     sharing_permission?: string;
//   }

//   declare interface DropboxTypes$team_log$SfTeamInviteType {
//     description: string;
//   }

//   /**
//   * Joined team member's shared folder.
//   */
//   declare interface DropboxTypes$team_log$SfTeamJoinDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;
//   }

//   /**
//   * Joined team member's shared folder from link.
//   */
//   declare interface DropboxTypes$team_log$SfTeamJoinFromOobLinkDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;

//     /**
//     * Shared link token key.
//     */
//     token_key?: string;

//     /**
//     * Sharing permission. Might be missing due to historical data gap.
//     */
//     sharing_permission?: string;
//   }

//   declare interface DropboxTypes$team_log$SfTeamJoinFromOobLinkType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$SfTeamJoinType {
//     description: string;
//   }

//   /**
//   * Unshared folder with team member.
//   */
//   declare interface DropboxTypes$team_log$SfTeamUninviteDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;

//     /**
//     * Original shared folder name.
//     */
//     original_folder_name: string;
//   }

//   declare interface DropboxTypes$team_log$SfTeamUninviteType {
//     description: string;
//   }

//   /**
//   * Invited user to Dropbox and added them to shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentAddInviteesDetails {
//     /**
//     * Shared content access level.
//     */
//     shared_content_access_level: DropboxTypes$sharing$AccessLevel;

//     /**
//     * A list of invitees.
//     */
//     invitees: Array<DropboxTypes$team_log$EmailAddress>;
//   }

//   declare interface DropboxTypes$team_log$SharedContentAddInviteesType {
//     description: string;
//   }

//   /**
//   * Added expiration date to link for shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentAddLinkExpiryDetails {
//     /**
//     * New shared content link expiration date. Might be missing due to
//     * historical data gap.
//     */
//     new_value?: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team_log$SharedContentAddLinkExpiryType {
//     description: string;
//   }

//   /**
//   * Added password to link for shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentAddLinkPasswordDetails {}

//   declare interface DropboxTypes$team_log$SharedContentAddLinkPasswordType {
//     description: string;
//   }

//   /**
//   * Added users and/or groups to shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentAddMemberDetails {
//     /**
//     * Shared content access level.
//     */
//     shared_content_access_level: DropboxTypes$sharing$AccessLevel;
//   }

//   declare interface DropboxTypes$team_log$SharedContentAddMemberType {
//     description: string;
//   }

//   /**
//   * Changed whether members can download shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentChangeDownloadsPolicyDetails {
//     /**
//     * New downloads policy.
//     */
//     new_value: DropboxTypes$team_log$DownloadPolicyType;

//     /**
//     * Previous downloads policy. Might be missing due to historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$DownloadPolicyType;
//   }

//   declare interface DropboxTypes$team_log$SharedContentChangeDownloadsPolicyType {
//     description: string;
//   }

//   /**
//   * Changed access type of invitee to shared file/folder before invite was
//   * accepted.
//   */
//   declare interface DropboxTypes$team_log$SharedContentChangeInviteeRoleDetails {
//     /**
//     * Previous access level. Might be missing due to historical data gap.
//     */
//     previous_access_level?: DropboxTypes$sharing$AccessLevel;

//     /**
//     * New access level.
//     */
//     new_access_level: DropboxTypes$sharing$AccessLevel;

//     /**
//     * The invitee whose role was changed.
//     */
//     invitee: DropboxTypes$team_log$EmailAddress;
//   }

//   declare interface DropboxTypes$team_log$SharedContentChangeInviteeRoleType {
//     description: string;
//   }

//   /**
//   * Changed link audience of shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentChangeLinkAudienceDetails {
//     /**
//     * New link audience value.
//     */
//     new_value: DropboxTypes$sharing$LinkAudience;

//     /**
//     * Previous link audience value.
//     */
//     previous_value?: DropboxTypes$sharing$LinkAudience;
//   }

//   declare interface DropboxTypes$team_log$SharedContentChangeLinkAudienceType {
//     description: string;
//   }

//   /**
//   * Changed link expiration of shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentChangeLinkExpiryDetails {
//     /**
//     * New shared content link expiration date. Might be missing due to
//     * historical data gap.
//     */
//     new_value?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * Previous shared content link expiration date. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team_log$SharedContentChangeLinkExpiryType {
//     description: string;
//   }

//   /**
//   * Changed link password of shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentChangeLinkPasswordDetails {}

//   declare interface DropboxTypes$team_log$SharedContentChangeLinkPasswordType {
//     description: string;
//   }

//   /**
//   * Changed access type of shared file/folder member.
//   */
//   declare interface DropboxTypes$team_log$SharedContentChangeMemberRoleDetails {
//     /**
//     * Previous access level. Might be missing due to historical data gap.
//     */
//     previous_access_level?: DropboxTypes$sharing$AccessLevel;

//     /**
//     * New access level.
//     */
//     new_access_level: DropboxTypes$sharing$AccessLevel;
//   }

//   declare interface DropboxTypes$team_log$SharedContentChangeMemberRoleType {
//     description: string;
//   }

//   /**
//   * Changed whether members can see who viewed shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentChangeViewerInfoPolicyDetails {
//     /**
//     * New viewer info policy.
//     */
//     new_value: DropboxTypes$sharing$ViewerInfoPolicy;

//     /**
//     * Previous view info policy. Might be missing due to historical data gap.
//     */
//     previous_value?: DropboxTypes$sharing$ViewerInfoPolicy;
//   }

//   declare interface DropboxTypes$team_log$SharedContentChangeViewerInfoPolicyType {
//     description: string;
//   }

//   /**
//   * Acquired membership of shared file/folder by accepting invite.
//   */
//   declare interface DropboxTypes$team_log$SharedContentClaimInvitationDetails {
//     /**
//     * Shared content link.
//     */
//     shared_content_link?: string;
//   }

//   declare interface DropboxTypes$team_log$SharedContentClaimInvitationType {
//     description: string;
//   }

//   /**
//   * Copied shared file/folder to own Dropbox.
//   */
//   declare interface DropboxTypes$team_log$SharedContentCopyDetails {
//     /**
//     * Shared content link.
//     */
//     shared_content_link: string;

//     /**
//     * The shared content owner.
//     */
//     shared_content_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;

//     /**
//     * Shared content access level.
//     */
//     shared_content_access_level: DropboxTypes$sharing$AccessLevel;

//     /**
//     * The path where the member saved the content.
//     */
//     destination_path: DropboxTypes$team_log$FilePath;
//   }

//   declare interface DropboxTypes$team_log$SharedContentCopyType {
//     description: string;
//   }

//   /**
//   * Downloaded shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentDownloadDetails {
//     /**
//     * Shared content link.
//     */
//     shared_content_link: string;

//     /**
//     * The shared content owner.
//     */
//     shared_content_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;

//     /**
//     * Shared content access level.
//     */
//     shared_content_access_level: DropboxTypes$sharing$AccessLevel;
//   }

//   declare interface DropboxTypes$team_log$SharedContentDownloadType {
//     description: string;
//   }

//   /**
//   * Left shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentRelinquishMembershipDetails {}

//   declare interface DropboxTypes$team_log$SharedContentRelinquishMembershipType {
//     description: string;
//   }

//   /**
//   * Removed invitee from shared file/folder before invite was accepted.
//   */
//   declare interface DropboxTypes$team_log$SharedContentRemoveInviteesDetails {
//     /**
//     * A list of invitees.
//     */
//     invitees: Array<DropboxTypes$team_log$EmailAddress>;
//   }

//   declare interface DropboxTypes$team_log$SharedContentRemoveInviteesType {
//     description: string;
//   }

//   /**
//   * Removed link expiration date of shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentRemoveLinkExpiryDetails {
//     /**
//     * Previous shared content link expiration date. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team_log$SharedContentRemoveLinkExpiryType {
//     description: string;
//   }

//   /**
//   * Removed link password of shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentRemoveLinkPasswordDetails {}

//   declare interface DropboxTypes$team_log$SharedContentRemoveLinkPasswordType {
//     description: string;
//   }

//   /**
//   * Removed user/group from shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentRemoveMemberDetails {
//     /**
//     * Shared content access level.
//     */
//     shared_content_access_level?: DropboxTypes$sharing$AccessLevel;
//   }

//   declare interface DropboxTypes$team_log$SharedContentRemoveMemberType {
//     description: string;
//   }

//   /**
//   * Requested access to shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentRequestAccessDetails {
//     /**
//     * Shared content link.
//     */
//     shared_content_link?: string;
//   }

//   declare interface DropboxTypes$team_log$SharedContentRequestAccessType {
//     description: string;
//   }

//   /**
//   * Unshared file/folder by clearing membership and turning off link.
//   */
//   declare interface DropboxTypes$team_log$SharedContentUnshareDetails {}

//   declare interface DropboxTypes$team_log$SharedContentUnshareType {
//     description: string;
//   }

//   /**
//   * Previewed shared file/folder.
//   */
//   declare interface DropboxTypes$team_log$SharedContentViewDetails {
//     /**
//     * Shared content link.
//     */
//     shared_content_link: string;

//     /**
//     * The shared content owner.
//     */
//     shared_content_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;

//     /**
//     * Shared content access level.
//     */
//     shared_content_access_level: DropboxTypes$sharing$AccessLevel;
//   }

//   declare interface DropboxTypes$team_log$SharedContentViewType {
//     description: string;
//   }

//   /**
//   * Changed who can access shared folder via link.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderChangeLinkPolicyDetails {
//     /**
//     * New shared folder link policy.
//     */
//     new_value: DropboxTypes$sharing$SharedLinkPolicy;

//     /**
//     * Previous shared folder link policy. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$sharing$SharedLinkPolicy;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderChangeLinkPolicyType {
//     description: string;
//   }

//   /**
//   * Changed whether shared folder inherits members from parent folder.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderChangeMembersInheritancePolicyDetails {
//     /**
//     * New member inheritance policy.
//     */
//     new_value: DropboxTypes$team_log$SharedFolderMembersInheritancePolicy;

//     /**
//     * Previous member inheritance policy. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$team_log$SharedFolderMembersInheritancePolicy;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderChangeMembersInheritancePolicyType {
//     description: string;
//   }

//   /**
//   * Changed who can add/remove members of shared folder.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderChangeMembersManagementPolicyDetails {
//     /**
//     * New members management policy.
//     */
//     new_value: DropboxTypes$sharing$AclUpdatePolicy;

//     /**
//     * Previous members management policy. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$sharing$AclUpdatePolicy;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderChangeMembersManagementPolicyType {
//     description: string;
//   }

//   /**
//   * Changed who can become member of shared folder.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderChangeMembersPolicyDetails {
//     /**
//     * New external invite policy.
//     */
//     new_value: DropboxTypes$sharing$MemberPolicy;

//     /**
//     * Previous external invite policy. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$sharing$MemberPolicy;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderChangeMembersPolicyType {
//     description: string;
//   }

//   /**
//   * Created shared folder.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderCreateDetails {
//     /**
//     * Target namespace ID. Might be missing due to historical data gap.
//     */
//     target_ns_id?: DropboxTypes$team_log$NamespaceId;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderCreateType {
//     description: string;
//   }

//   /**
//   * Declined team member's invite to shared folder.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderDeclineInvitationDetails {}

//   declare interface DropboxTypes$team_log$SharedFolderDeclineInvitationType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderMembersInheritancePolicyInheritMembers {
//     ".tag": "inherit_members";
//   }

//   declare interface DropboxTypes$team_log$SharedFolderMembersInheritancePolicyDontInheritMembers {
//     ".tag": "dont_inherit_members";
//   }

//   declare interface DropboxTypes$team_log$SharedFolderMembersInheritancePolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Specifies if a shared folder inherits its members from the parent folder.
//   */
//   declare type DropboxTypes$team_log$SharedFolderMembersInheritancePolicy =
//     | DropboxTypes$team_log$SharedFolderMembersInheritancePolicyInheritMembers
//     | DropboxTypes$team_log$SharedFolderMembersInheritancePolicyDontInheritMembers
//     | DropboxTypes$team_log$SharedFolderMembersInheritancePolicyOther;

//   /**
//   * Added shared folder to own Dropbox.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderMountDetails {}

//   declare interface DropboxTypes$team_log$SharedFolderMountType {
//     description: string;
//   }

//   /**
//   * Changed parent of shared folder.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderNestDetails {
//     /**
//     * Previous parent namespace ID. Might be missing due to historical data
//     * gap.
//     */
//     previous_parent_ns_id?: DropboxTypes$team_log$NamespaceId;

//     /**
//     * New parent namespace ID. Might be missing due to historical data gap.
//     */
//     new_parent_ns_id?: DropboxTypes$team_log$NamespaceId;

//     /**
//     * Previous namespace path. Might be missing due to historical data gap.
//     */
//     previous_ns_path?: DropboxTypes$team_log$FilePath;

//     /**
//     * New namespace path. Might be missing due to historical data gap.
//     */
//     new_ns_path?: DropboxTypes$team_log$FilePath;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderNestType {
//     description: string;
//   }

//   /**
//   * Transferred ownership of shared folder to another member.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderTransferOwnershipDetails {
//     /**
//     * The email address of the previous shared folder owner.
//     */
//     previous_owner_email?: DropboxTypes$team_log$EmailAddress;

//     /**
//     * The email address of the new shared folder owner.
//     */
//     new_owner_email: DropboxTypes$team_log$EmailAddress;
//   }

//   declare interface DropboxTypes$team_log$SharedFolderTransferOwnershipType {
//     description: string;
//   }

//   /**
//   * Deleted shared folder from Dropbox.
//   */
//   declare interface DropboxTypes$team_log$SharedFolderUnmountDetails {}

//   declare interface DropboxTypes$team_log$SharedFolderUnmountType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkAccessLevelNone {
//     ".tag": "none";
//   }

//   declare interface DropboxTypes$team_log$SharedLinkAccessLevelReader {
//     ".tag": "reader";
//   }

//   declare interface DropboxTypes$team_log$SharedLinkAccessLevelWriter {
//     ".tag": "writer";
//   }

//   declare interface DropboxTypes$team_log$SharedLinkAccessLevelOther {
//     ".tag": "other";
//   }

//   /**
//   * Shared link access level.
//   */
//   declare type DropboxTypes$team_log$SharedLinkAccessLevel =
//     | DropboxTypes$team_log$SharedLinkAccessLevelNone
//     | DropboxTypes$team_log$SharedLinkAccessLevelReader
//     | DropboxTypes$team_log$SharedLinkAccessLevelWriter
//     | DropboxTypes$team_log$SharedLinkAccessLevelOther;

//   /**
//   * Added shared link expiration date.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkAddExpiryDetails {
//     /**
//     * New shared link expiration date.
//     */
//     new_value: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkAddExpiryType {
//     description: string;
//   }

//   /**
//   * Changed shared link expiration date.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkChangeExpiryDetails {
//     /**
//     * New shared link expiration date. Might be missing due to historical
//     * data gap.
//     */
//     new_value?: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * Previous shared link expiration date. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkChangeExpiryType {
//     description: string;
//   }

//   /**
//   * Changed visibility of shared link.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkChangeVisibilityDetails {
//     /**
//     * New shared link visibility.
//     */
//     new_value: DropboxTypes$team_log$SharedLinkVisibility;

//     /**
//     * Previous shared link visibility. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$team_log$SharedLinkVisibility;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkChangeVisibilityType {
//     description: string;
//   }

//   /**
//   * Added file/folder to Dropbox from shared link.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkCopyDetails {
//     /**
//     * Shared link owner details. Might be missing due to historical data gap.
//     */
//     shared_link_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkCopyType {
//     description: string;
//   }

//   /**
//   * Created shared link.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkCreateDetails {
//     /**
//     * Defines who can access the shared link. Might be missing due to
//     * historical data gap.
//     */
//     shared_link_access_level?: DropboxTypes$team_log$SharedLinkAccessLevel;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkCreateType {
//     description: string;
//   }

//   /**
//   * Removed shared link.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkDisableDetails {
//     /**
//     * Shared link owner details. Might be missing due to historical data gap.
//     */
//     shared_link_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkDisableType {
//     description: string;
//   }

//   /**
//   * Downloaded file/folder from shared link.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkDownloadDetails {
//     /**
//     * Shared link owner details. Might be missing due to historical data gap.
//     */
//     shared_link_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkDownloadType {
//     description: string;
//   }

//   /**
//   * Removed shared link expiration date.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkRemoveExpiryDetails {
//     /**
//     * Previous shared link expiration date. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$common$DropboxTimestamp;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkRemoveExpiryType {
//     description: string;
//   }

//   /**
//   * Added members as audience of shared link.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkShareDetails {
//     /**
//     * Shared link owner details. Might be missing due to historical data gap.
//     */
//     shared_link_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;

//     /**
//     * Users without a Dropbox account that were added as shared link
//     * audience.
//     */
//     external_users?: Array<DropboxTypes$team_log$ExternalUserLogInfo>;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkShareType {
//     description: string;
//   }

//   /**
//   * Opened shared link.
//   */
//   declare interface DropboxTypes$team_log$SharedLinkViewDetails {
//     /**
//     * Shared link owner details. Might be missing due to historical data gap.
//     */
//     shared_link_owner?:
//       | DropboxTypes$team_log$TeamMemberLogInfoReference
//       | DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$NonTeamMemberLogInfoReference
//       | DropboxTypes$team_log$UserLogInfoReference;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkViewType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$SharedLinkVisibilityPassword {
//     ".tag": "password";
//   }

//   declare interface DropboxTypes$team_log$SharedLinkVisibilityPublic {
//     ".tag": "public";
//   }

//   declare interface DropboxTypes$team_log$SharedLinkVisibilityTeamOnly {
//     ".tag": "team_only";
//   }

//   declare interface DropboxTypes$team_log$SharedLinkVisibilityOther {
//     ".tag": "other";
//   }

//   /**
//   * Defines who has access to a shared link.
//   */
//   declare type DropboxTypes$team_log$SharedLinkVisibility =
//     | DropboxTypes$team_log$SharedLinkVisibilityPassword
//     | DropboxTypes$team_log$SharedLinkVisibilityPublic
//     | DropboxTypes$team_log$SharedLinkVisibilityTeamOnly
//     | DropboxTypes$team_log$SharedLinkVisibilityOther;

//   /**
//   * Opened shared Paper doc.
//   */
//   declare interface DropboxTypes$team_log$SharedNoteOpenedDetails {}

//   declare interface DropboxTypes$team_log$SharedNoteOpenedType {
//     description: string;
//   }

//   /**
//   * Changed whether team members can join shared folders owned outside team.
//   */
//   declare interface DropboxTypes$team_log$SharingChangeFolderJoinPolicyDetails {
//     /**
//     * New external join policy.
//     */
//     new_value: DropboxTypes$team_log$SharingFolderJoinPolicy;

//     /**
//     * Previous external join policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_log$SharingFolderJoinPolicy;
//   }

//   declare interface DropboxTypes$team_log$SharingChangeFolderJoinPolicyType {
//     description: string;
//   }

//   /**
//   * Changed whether members can share links outside team, and if links are
//   * accessible only by team members or anyone by default.
//   */
//   declare interface DropboxTypes$team_log$SharingChangeLinkPolicyDetails {
//     /**
//     * New external link accessibility policy.
//     */
//     new_value: DropboxTypes$team_log$SharingLinkPolicy;

//     /**
//     * Previous external link accessibility policy. Might be missing due to
//     * historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$SharingLinkPolicy;
//   }

//   declare interface DropboxTypes$team_log$SharingChangeLinkPolicyType {
//     description: string;
//   }

//   /**
//   * Changed whether members can share files/folders outside team.
//   */
//   declare interface DropboxTypes$team_log$SharingChangeMemberPolicyDetails {
//     /**
//     * New external invite policy.
//     */
//     new_value: DropboxTypes$team_log$SharingMemberPolicy;

//     /**
//     * Previous external invite policy. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: DropboxTypes$team_log$SharingMemberPolicy;
//   }

//   declare interface DropboxTypes$team_log$SharingChangeMemberPolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$SharingFolderJoinPolicyFromAnyone {
//     ".tag": "from_anyone";
//   }

//   declare interface DropboxTypes$team_log$SharingFolderJoinPolicyFromTeamOnly {
//     ".tag": "from_team_only";
//   }

//   declare interface DropboxTypes$team_log$SharingFolderJoinPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if team members can join shared folders owned by
//   * non team members.
//   */
//   declare type DropboxTypes$team_log$SharingFolderJoinPolicy =
//     | DropboxTypes$team_log$SharingFolderJoinPolicyFromAnyone
//     | DropboxTypes$team_log$SharingFolderJoinPolicyFromTeamOnly
//     | DropboxTypes$team_log$SharingFolderJoinPolicyOther;

//   declare interface DropboxTypes$team_log$SharingLinkPolicyDefaultPrivate {
//     ".tag": "default_private";
//   }

//   declare interface DropboxTypes$team_log$SharingLinkPolicyDefaultPublic {
//     ".tag": "default_public";
//   }

//   declare interface DropboxTypes$team_log$SharingLinkPolicyOnlyPrivate {
//     ".tag": "only_private";
//   }

//   declare interface DropboxTypes$team_log$SharingLinkPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if team members can share links externally
//   */
//   declare type DropboxTypes$team_log$SharingLinkPolicy =
//     | DropboxTypes$team_log$SharingLinkPolicyDefaultPrivate
//     | DropboxTypes$team_log$SharingLinkPolicyDefaultPublic
//     | DropboxTypes$team_log$SharingLinkPolicyOnlyPrivate
//     | DropboxTypes$team_log$SharingLinkPolicyOther;

//   declare interface DropboxTypes$team_log$SharingMemberPolicyAllow {
//     ".tag": "allow";
//   }

//   declare interface DropboxTypes$team_log$SharingMemberPolicyForbid {
//     ".tag": "forbid";
//   }

//   declare interface DropboxTypes$team_log$SharingMemberPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * External sharing policy
//   */
//   declare type DropboxTypes$team_log$SharingMemberPolicy =
//     | DropboxTypes$team_log$SharingMemberPolicyAllow
//     | DropboxTypes$team_log$SharingMemberPolicyForbid
//     | DropboxTypes$team_log$SharingMemberPolicyOther;

//   /**
//   * Shared link with group.
//   */
//   declare interface DropboxTypes$team_log$ShmodelGroupShareDetails {}

//   declare interface DropboxTypes$team_log$ShmodelGroupShareType {
//     description: string;
//   }

//   /**
//   * Granted access to showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseAccessGrantedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseAccessGrantedType {
//     description: string;
//   }

//   /**
//   * Added member to showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseAddMemberDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseAddMemberType {
//     description: string;
//   }

//   /**
//   * Archived showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseArchivedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseArchivedType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled downloading files from Dropbox Showcase for team.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseChangeDownloadPolicyDetails {
//     /**
//     * New Dropbox Showcase download policy.
//     */
//     new_value: DropboxTypes$team_log$ShowcaseDownloadPolicy;

//     /**
//     * Previous Dropbox Showcase download policy.
//     */
//     previous_value: DropboxTypes$team_log$ShowcaseDownloadPolicy;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseChangeDownloadPolicyType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled Dropbox Showcase for team.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseChangeEnabledPolicyDetails {
//     /**
//     * New Dropbox Showcase policy.
//     */
//     new_value: DropboxTypes$team_log$ShowcaseEnabledPolicy;

//     /**
//     * Previous Dropbox Showcase policy.
//     */
//     previous_value: DropboxTypes$team_log$ShowcaseEnabledPolicy;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseChangeEnabledPolicyType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled sharing Dropbox Showcase externally for team.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseChangeExternalSharingPolicyDetails {
//     /**
//     * New Dropbox Showcase external sharing policy.
//     */
//     new_value: DropboxTypes$team_log$ShowcaseExternalSharingPolicy;

//     /**
//     * Previous Dropbox Showcase external sharing policy.
//     */
//     previous_value: DropboxTypes$team_log$ShowcaseExternalSharingPolicy;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseChangeExternalSharingPolicyType {
//     description: string;
//   }

//   /**
//   * Created showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseCreatedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseCreatedType {
//     description: string;
//   }

//   /**
//   * Deleted showcase comment.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseDeleteCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseDeleteCommentType {
//     description: string;
//   }

//   /**
//   * Showcase document's logged information.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseDocumentLogInfo {
//     /**
//     * Showcase document Id.
//     */
//     showcase_id: string;

//     /**
//     * Showcase document title.
//     */
//     showcase_title: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseDownloadPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$ShowcaseDownloadPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$ShowcaseDownloadPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if files can be downloaded from Showcases by team
//   * members
//   */
//   declare type DropboxTypes$team_log$ShowcaseDownloadPolicy =
//     | DropboxTypes$team_log$ShowcaseDownloadPolicyDisabled
//     | DropboxTypes$team_log$ShowcaseDownloadPolicyEnabled
//     | DropboxTypes$team_log$ShowcaseDownloadPolicyOther;

//   /**
//   * Edited showcase comment.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseEditCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseEditCommentType {
//     description: string;
//   }

//   /**
//   * Edited showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseEditedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseEditedType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseEnabledPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$ShowcaseEnabledPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$ShowcaseEnabledPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling whether Showcase is enabled.
//   */
//   declare type DropboxTypes$team_log$ShowcaseEnabledPolicy =
//     | DropboxTypes$team_log$ShowcaseEnabledPolicyDisabled
//     | DropboxTypes$team_log$ShowcaseEnabledPolicyEnabled
//     | DropboxTypes$team_log$ShowcaseEnabledPolicyOther;

//   declare interface DropboxTypes$team_log$ShowcaseExternalSharingPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$ShowcaseExternalSharingPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$ShowcaseExternalSharingPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling if team members can share Showcases externally.
//   */
//   declare type DropboxTypes$team_log$ShowcaseExternalSharingPolicy =
//     | DropboxTypes$team_log$ShowcaseExternalSharingPolicyDisabled
//     | DropboxTypes$team_log$ShowcaseExternalSharingPolicyEnabled
//     | DropboxTypes$team_log$ShowcaseExternalSharingPolicyOther;

//   /**
//   * Added file to showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseFileAddedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseFileAddedType {
//     description: string;
//   }

//   /**
//   * Downloaded file from showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseFileDownloadDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Showcase download type.
//     */
//     download_type: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseFileDownloadType {
//     description: string;
//   }

//   /**
//   * Removed file from showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseFileRemovedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseFileRemovedType {
//     description: string;
//   }

//   /**
//   * Viewed file in showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseFileViewDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseFileViewType {
//     description: string;
//   }

//   /**
//   * Permanently deleted showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcasePermanentlyDeletedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcasePermanentlyDeletedType {
//     description: string;
//   }

//   /**
//   * Added showcase comment.
//   */
//   declare interface DropboxTypes$team_log$ShowcasePostCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcasePostCommentType {
//     description: string;
//   }

//   /**
//   * Removed member from showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseRemoveMemberDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseRemoveMemberType {
//     description: string;
//   }

//   /**
//   * Renamed showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseRenamedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseRenamedType {
//     description: string;
//   }

//   /**
//   * Requested access to showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseRequestAccessDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseRequestAccessType {
//     description: string;
//   }

//   /**
//   * Resolved showcase comment.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseResolveCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseResolveCommentType {
//     description: string;
//   }

//   /**
//   * Unarchived showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseRestoredDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseRestoredType {
//     description: string;
//   }

//   /**
//   * Deleted showcase (old version).
//   */
//   declare interface DropboxTypes$team_log$ShowcaseTrashedDeprecatedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseTrashedDeprecatedType {
//     description: string;
//   }

//   /**
//   * Deleted showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseTrashedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseTrashedType {
//     description: string;
//   }

//   /**
//   * Unresolved showcase comment.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseUnresolveCommentDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;

//     /**
//     * Comment text.
//     */
//     comment_text?: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseUnresolveCommentType {
//     description: string;
//   }

//   /**
//   * Restored showcase (old version).
//   */
//   declare interface DropboxTypes$team_log$ShowcaseUntrashedDeprecatedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseUntrashedDeprecatedType {
//     description: string;
//   }

//   /**
//   * Restored showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseUntrashedDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseUntrashedType {
//     description: string;
//   }

//   /**
//   * Viewed showcase.
//   */
//   declare interface DropboxTypes$team_log$ShowcaseViewDetails {
//     /**
//     * Event unique identifier.
//     */
//     event_uuid: string;
//   }

//   declare interface DropboxTypes$team_log$ShowcaseViewType {
//     description: string;
//   }

//   /**
//   * Ended admin sign-in-as session.
//   */
//   declare interface DropboxTypes$team_log$SignInAsSessionEndDetails {}

//   declare interface DropboxTypes$team_log$SignInAsSessionEndType {
//     description: string;
//   }

//   /**
//   * Started admin sign-in-as session.
//   */
//   declare interface DropboxTypes$team_log$SignInAsSessionStartDetails {}

//   declare interface DropboxTypes$team_log$SignInAsSessionStartType {
//     description: string;
//   }

//   /**
//   * Changed default Smart Sync setting for team members.
//   */
//   declare interface DropboxTypes$team_log$SmartSyncChangePolicyDetails {
//     /**
//     * New smart sync policy.
//     */
//     new_value?: DropboxTypes$team_policies$SmartSyncPolicy;

//     /**
//     * Previous smart sync policy.
//     */
//     previous_value?: DropboxTypes$team_policies$SmartSyncPolicy;
//   }

//   declare interface DropboxTypes$team_log$SmartSyncChangePolicyType {
//     description: string;
//   }

//   /**
//   * Created Smart Sync non-admin devices report.
//   */
//   declare interface DropboxTypes$team_log$SmartSyncCreateAdminPrivilegeReportDetails {}

//   declare interface DropboxTypes$team_log$SmartSyncCreateAdminPrivilegeReportType {
//     description: string;
//   }

//   /**
//   * Opted team into Smart Sync.
//   */
//   declare interface DropboxTypes$team_log$SmartSyncNotOptOutDetails {
//     /**
//     * Previous Smart Sync opt out policy.
//     */
//     previous_value: DropboxTypes$team_log$SmartSyncOptOutPolicy;

//     /**
//     * New Smart Sync opt out policy.
//     */
//     new_value: DropboxTypes$team_log$SmartSyncOptOutPolicy;
//   }

//   declare interface DropboxTypes$team_log$SmartSyncNotOptOutType {
//     description: string;
//   }

//   /**
//   * Opted team out of Smart Sync.
//   */
//   declare interface DropboxTypes$team_log$SmartSyncOptOutDetails {
//     /**
//     * Previous Smart Sync opt out policy.
//     */
//     previous_value: DropboxTypes$team_log$SmartSyncOptOutPolicy;

//     /**
//     * New Smart Sync opt out policy.
//     */
//     new_value: DropboxTypes$team_log$SmartSyncOptOutPolicy;
//   }

//   declare interface DropboxTypes$team_log$SmartSyncOptOutPolicyDefault {
//     ".tag": "default";
//   }

//   declare interface DropboxTypes$team_log$SmartSyncOptOutPolicyOptedOut {
//     ".tag": "opted_out";
//   }

//   declare interface DropboxTypes$team_log$SmartSyncOptOutPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$SmartSyncOptOutPolicy =
//     | DropboxTypes$team_log$SmartSyncOptOutPolicyDefault
//     | DropboxTypes$team_log$SmartSyncOptOutPolicyOptedOut
//     | DropboxTypes$team_log$SmartSyncOptOutPolicyOther;

//   declare interface DropboxTypes$team_log$SmartSyncOptOutType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$SpaceCapsTypeHard {
//     ".tag": "hard";
//   }

//   declare interface DropboxTypes$team_log$SpaceCapsTypeOff {
//     ".tag": "off";
//   }

//   declare interface DropboxTypes$team_log$SpaceCapsTypeSoft {
//     ".tag": "soft";
//   }

//   declare interface DropboxTypes$team_log$SpaceCapsTypeOther {
//     ".tag": "other";
//   }

//   /**
//   * Space limit alert policy
//   */
//   declare type DropboxTypes$team_log$SpaceCapsType =
//     | DropboxTypes$team_log$SpaceCapsTypeHard
//     | DropboxTypes$team_log$SpaceCapsTypeOff
//     | DropboxTypes$team_log$SpaceCapsTypeSoft
//     | DropboxTypes$team_log$SpaceCapsTypeOther;

//   declare interface DropboxTypes$team_log$SpaceLimitsStatusWithinQuota {
//     ".tag": "within_quota";
//   }

//   declare interface DropboxTypes$team_log$SpaceLimitsStatusNearQuota {
//     ".tag": "near_quota";
//   }

//   declare interface DropboxTypes$team_log$SpaceLimitsStatusOverQuota {
//     ".tag": "over_quota";
//   }

//   declare interface DropboxTypes$team_log$SpaceLimitsStatusOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$SpaceLimitsStatus =
//     | DropboxTypes$team_log$SpaceLimitsStatusWithinQuota
//     | DropboxTypes$team_log$SpaceLimitsStatusNearQuota
//     | DropboxTypes$team_log$SpaceLimitsStatusOverQuota
//     | DropboxTypes$team_log$SpaceLimitsStatusOther;

//   /**
//   * Added X.509 certificate for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoAddCertDetails {
//     /**
//     * SSO certificate details.
//     */
//     certificate_details: DropboxTypes$team_log$Certificate;
//   }

//   declare interface DropboxTypes$team_log$SsoAddCertType {
//     description: string;
//   }

//   /**
//   * Added sign-in URL for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoAddLoginUrlDetails {
//     /**
//     * New single sign-on login URL.
//     */
//     new_value: string;
//   }

//   declare interface DropboxTypes$team_log$SsoAddLoginUrlType {
//     description: string;
//   }

//   /**
//   * Added sign-out URL for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoAddLogoutUrlDetails {
//     /**
//     * New single sign-on logout URL. Might be missing due to historical data
//     * gap.
//     */
//     new_value?: string;
//   }

//   declare interface DropboxTypes$team_log$SsoAddLogoutUrlType {
//     description: string;
//   }

//   /**
//   * Changed X.509 certificate for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoChangeCertDetails {
//     /**
//     * Previous SSO certificate details. Might be missing due to historical
//     * data gap.
//     */
//     previous_certificate_details?: DropboxTypes$team_log$Certificate;

//     /**
//     * New SSO certificate details.
//     */
//     new_certificate_details: DropboxTypes$team_log$Certificate;
//   }

//   declare interface DropboxTypes$team_log$SsoChangeCertType {
//     description: string;
//   }

//   /**
//   * Changed sign-in URL for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoChangeLoginUrlDetails {
//     /**
//     * Previous single sign-on login URL.
//     */
//     previous_value: string;

//     /**
//     * New single sign-on login URL.
//     */
//     new_value: string;
//   }

//   declare interface DropboxTypes$team_log$SsoChangeLoginUrlType {
//     description: string;
//   }

//   /**
//   * Changed sign-out URL for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoChangeLogoutUrlDetails {
//     /**
//     * Previous single sign-on logout URL. Might be missing due to historical
//     * data gap.
//     */
//     previous_value?: string;

//     /**
//     * New single sign-on logout URL. Might be missing due to historical data
//     * gap.
//     */
//     new_value?: string;
//   }

//   declare interface DropboxTypes$team_log$SsoChangeLogoutUrlType {
//     description: string;
//   }

//   /**
//   * Changed single sign-on setting for team.
//   */
//   declare interface DropboxTypes$team_log$SsoChangePolicyDetails {
//     /**
//     * New single sign-on policy.
//     */
//     new_value: DropboxTypes$team_policies$SsoPolicy;

//     /**
//     * Previous single sign-on policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_policies$SsoPolicy;
//   }

//   declare interface DropboxTypes$team_log$SsoChangePolicyType {
//     description: string;
//   }

//   /**
//   * Changed SAML identity mode for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoChangeSamlIdentityModeDetails {
//     /**
//     * Previous single sign-on identity mode.
//     */
//     previous_value: number;

//     /**
//     * New single sign-on identity mode.
//     */
//     new_value: number;
//   }

//   declare interface DropboxTypes$team_log$SsoChangeSamlIdentityModeType {
//     description: string;
//   }

//   /**
//   * Failed to sign in via SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoErrorDetails {
//     /**
//     * Error details.
//     */
//     error_details: DropboxTypes$team_log$FailureDetailsLogInfo;
//   }

//   declare interface DropboxTypes$team_log$SsoErrorType {
//     description: string;
//   }

//   /**
//   * Removed X.509 certificate for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoRemoveCertDetails {}

//   declare interface DropboxTypes$team_log$SsoRemoveCertType {
//     description: string;
//   }

//   /**
//   * Removed sign-in URL for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoRemoveLoginUrlDetails {
//     /**
//     * Previous single sign-on login URL.
//     */
//     previous_value: string;
//   }

//   declare interface DropboxTypes$team_log$SsoRemoveLoginUrlType {
//     description: string;
//   }

//   /**
//   * Removed sign-out URL for SSO.
//   */
//   declare interface DropboxTypes$team_log$SsoRemoveLogoutUrlDetails {
//     /**
//     * Previous single sign-on logout URL.
//     */
//     previous_value: string;
//   }

//   declare interface DropboxTypes$team_log$SsoRemoveLogoutUrlType {
//     description: string;
//   }

//   /**
//   * Created team activity report.
//   */
//   declare interface DropboxTypes$team_log$TeamActivityCreateReportDetails {
//     /**
//     * Report start date.
//     */
//     start_date: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * Report end date.
//     */
//     end_date: DropboxTypes$common$DropboxTimestamp;
//   }

//   /**
//   * Couldn't generate team activity report.
//   */
//   declare interface DropboxTypes$team_log$TeamActivityCreateReportFailDetails {
//     /**
//     * Failure reason.
//     */
//     failure_reason: DropboxTypes$team$TeamReportFailureReason;
//   }

//   declare interface DropboxTypes$team_log$TeamActivityCreateReportFailType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TeamActivityCreateReportType {
//     description: string;
//   }

//   /**
//   * An audit log event.
//   */
//   declare interface DropboxTypes$team_log$TeamEvent {
//     /**
//     * The Dropbox timestamp representing when the action was taken.
//     */
//     timestamp: DropboxTypes$common$DropboxTimestamp;

//     /**
//     * The category that this type of action belongs to.
//     */
//     event_category: DropboxTypes$team_log$EventCategory;

//     /**
//     * The entity who actually performed the action. Might be missing due to
//     * historical data gap.
//     */
//     actor?: DropboxTypes$team_log$ActorLogInfo;

//     /**
//     * The origin from which the actor performed the action including
//     * information about host, ip address, location, session, etc. If the
//     * action was performed programmatically via the API the origin represents
//     * the API client.
//     */
//     origin?: DropboxTypes$team_log$OriginLogInfo;

//     /**
//     * True if the action involved a non team member either as the actor or as
//     * one of the affected users. Might be missing due to historical data gap.
//     */
//     involve_non_team_member?: boolean;

//     /**
//     * The user or team on whose behalf the actor performed the action. Might
//     * be missing due to historical data gap.
//     */
//     context?: DropboxTypes$team_log$ContextLogInfo;

//     /**
//     * Zero or more users and/or groups that are affected by the action. Note
//     * that this list doesn't include any actors or users in context.
//     */
//     participants?: Array<DropboxTypes$team_log$ParticipantLogInfo>;

//     /**
//     * Zero or more content assets involved in the action. Currently these
//     * include Dropbox files and folders but in the future we might add other
//     * asset types such as Paper documents, folders, projects, etc.
//     */
//     assets?: Array<DropboxTypes$team_log$AssetLogInfo>;

//     /**
//     * The particular type of action taken.
//     */
//     event_type: DropboxTypes$team_log$EventType;

//     /**
//     * The variable event schema applicable to this type of action,
//     * instantiated with respect to this particular action.
//     */
//     details: DropboxTypes$team_log$EventDetails;
//   }

//   declare interface DropboxTypes$team_log$TeamExtensionsPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$TeamExtensionsPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$TeamExtensionsPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling whether App Integrations are enabled for the team.
//   */
//   declare type DropboxTypes$team_log$TeamExtensionsPolicy =
//     | DropboxTypes$team_log$TeamExtensionsPolicyDisabled
//     | DropboxTypes$team_log$TeamExtensionsPolicyEnabled
//     | DropboxTypes$team_log$TeamExtensionsPolicyOther;

//   /**
//   * Changed App Integrations setting for team.
//   */
//   declare interface DropboxTypes$team_log$TeamExtensionsPolicyChangedDetails {
//     /**
//     * New Extensions policy.
//     */
//     new_value: DropboxTypes$team_log$TeamExtensionsPolicy;

//     /**
//     * Previous Extensions policy.
//     */
//     previous_value: DropboxTypes$team_log$TeamExtensionsPolicy;
//   }

//   declare interface DropboxTypes$team_log$TeamExtensionsPolicyChangedType {
//     description: string;
//   }

//   /**
//   * Changed archival status of team folder.
//   */
//   declare interface DropboxTypes$team_log$TeamFolderChangeStatusDetails {
//     /**
//     * New team folder status.
//     */
//     new_value: DropboxTypes$team$TeamFolderStatus;

//     /**
//     * Previous team folder status. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team$TeamFolderStatus;
//   }

//   declare interface DropboxTypes$team_log$TeamFolderChangeStatusType {
//     description: string;
//   }

//   /**
//   * Created team folder in active status.
//   */
//   declare interface DropboxTypes$team_log$TeamFolderCreateDetails {}

//   declare interface DropboxTypes$team_log$TeamFolderCreateType {
//     description: string;
//   }

//   /**
//   * Downgraded team folder to regular shared folder.
//   */
//   declare interface DropboxTypes$team_log$TeamFolderDowngradeDetails {
//     /**
//     * Target asset position in the Assets list.
//     */
//     target_asset_index: number;
//   }

//   declare interface DropboxTypes$team_log$TeamFolderDowngradeType {
//     description: string;
//   }

//   /**
//   * Permanently deleted archived team folder.
//   */
//   declare interface DropboxTypes$team_log$TeamFolderPermanentlyDeleteDetails {}

//   declare interface DropboxTypes$team_log$TeamFolderPermanentlyDeleteType {
//     description: string;
//   }

//   /**
//   * Renamed active/archived team folder.
//   */
//   declare interface DropboxTypes$team_log$TeamFolderRenameDetails {
//     /**
//     * Previous folder name.
//     */
//     previous_folder_name: string;

//     /**
//     * New folder name.
//     */
//     new_folder_name: string;
//   }

//   declare interface DropboxTypes$team_log$TeamFolderRenameType {
//     description: string;
//   }

//   /**
//   * Team linked app
//   */
//   declare type DropboxTypes$team_log$TeamLinkedAppLogInfo = {
//     ...
//   } & DropboxTypes$team_log$AppLogInfo;

//   /**
//   * Reference to the TeamLinkedAppLogInfo type, identified by the value of
//   * the .tag property.
//   */
//   declare type DropboxTypes$team_log$TeamLinkedAppLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "team_linked_app",
//     ...
//   } & DropboxTypes$team_log$TeamLinkedAppLogInfo;

//   /**
//   * Team member's logged information.
//   */
//   declare type DropboxTypes$team_log$TeamMemberLogInfo = {
//     /**
//     * Team member ID. Might be missing due to historical data gap.
//     */
//     team_member_id?: DropboxTypes$team_common$TeamMemberId,

//     /**
//     * Team member external ID.
//     */
//     member_external_id?: DropboxTypes$team_common$MemberExternalId,
//     ...
//   } & DropboxTypes$team_log$UserLogInfo;

//   /**
//   * Reference to the TeamMemberLogInfo type, identified by the value of the
//   * .tag property.
//   */
//   declare type DropboxTypes$team_log$TeamMemberLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "team_member",
//     ...
//   } & DropboxTypes$team_log$TeamMemberLogInfo;

//   declare interface DropboxTypes$team_log$TeamMembershipTypeFree {
//     ".tag": "free";
//   }

//   declare interface DropboxTypes$team_log$TeamMembershipTypeFull {
//     ".tag": "full";
//   }

//   declare interface DropboxTypes$team_log$TeamMembershipTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$TeamMembershipType =
//     | DropboxTypes$team_log$TeamMembershipTypeFree
//     | DropboxTypes$team_log$TeamMembershipTypeFull
//     | DropboxTypes$team_log$TeamMembershipTypeOther;

//   /**
//   * Merged another team into this team.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeFromDetails {
//     /**
//     * The name of the team that was merged into this team.
//     */
//     team_name: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeFromType {
//     description: string;
//   }

//   /**
//   * Accepted a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestAcceptedDetails {
//     /**
//     * Team merge request acceptance details.
//     */
//     request_accepted_details: DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetails;
//   }

//   /**
//   * Team merge request accepted details shown to the primary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetailsPrimaryTeam = {
//     ".tag": "primary_team",
//     ...
//   } & DropboxTypes$team_log$PrimaryTeamRequestAcceptedDetails;

//   /**
//   * Team merge request accepted details shown to the secondary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetailsSecondaryTeam = {
//     ".tag": "secondary_team",
//     ...
//   } & DropboxTypes$team_log$SecondaryTeamRequestAcceptedDetails;

//   declare interface DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetailsOther {
//     ".tag": "other";
//   }

//   /**
//   * Team merge request acceptance details
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetails =
//     | DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetailsPrimaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetailsSecondaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestAcceptedExtraDetailsOther;

//   /**
//   * Accepted a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestAcceptedShownToPrimaryTeamDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestAcceptedShownToPrimaryTeamType {
//     description: string;
//   }

//   /**
//   * Accepted a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestAcceptedShownToSecondaryTeamDetails {
//     /**
//     * The primary team name.
//     */
//     primary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestAcceptedShownToSecondaryTeamType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestAcceptedType {
//     description: string;
//   }

//   /**
//   * Automatically canceled team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestAutoCanceledDetails {
//     /**
//     * The cancellation reason.
//     */
//     details?: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestAutoCanceledType {
//     description: string;
//   }

//   /**
//   * Canceled a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestCanceledDetails {
//     /**
//     * Team merge request cancellation details.
//     */
//     request_canceled_details: DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetails;
//   }

//   /**
//   * Team merge request cancellation details shown to the primary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetailsPrimaryTeam = {
//     ".tag": "primary_team",
//     ...
//   } & DropboxTypes$team_log$PrimaryTeamRequestCanceledDetails;

//   /**
//   * Team merge request cancellation details shown to the secondary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetailsSecondaryTeam = {
//     ".tag": "secondary_team",
//     ...
//   } & DropboxTypes$team_log$SecondaryTeamRequestCanceledDetails;

//   declare interface DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetailsOther {
//     ".tag": "other";
//   }

//   /**
//   * Team merge request cancellation details
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetails =
//     | DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetailsPrimaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetailsSecondaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestCanceledExtraDetailsOther;

//   /**
//   * Canceled a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestCanceledShownToPrimaryTeamDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestCanceledShownToPrimaryTeamType {
//     description: string;
//   }

//   /**
//   * Canceled a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestCanceledShownToSecondaryTeamDetails {
//     /**
//     * The email of the primary team admin that the request was sent to.
//     */
//     sent_to: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestCanceledShownToSecondaryTeamType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestCanceledType {
//     description: string;
//   }

//   /**
//   * Team merge request expired.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestExpiredDetails {
//     /**
//     * Team merge request expiration details.
//     */
//     request_expired_details: DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetails;
//   }

//   /**
//   * Team merge request canceled details shown to the primary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetailsPrimaryTeam = {
//     ".tag": "primary_team",
//     ...
//   } & DropboxTypes$team_log$PrimaryTeamRequestExpiredDetails;

//   /**
//   * Team merge request canceled details shown to the secondary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetailsSecondaryTeam = {
//     ".tag": "secondary_team",
//     ...
//   } & DropboxTypes$team_log$SecondaryTeamRequestExpiredDetails;

//   declare interface DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetailsOther {
//     ".tag": "other";
//   }

//   /**
//   * Team merge request expiration details
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetails =
//     | DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetailsPrimaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetailsSecondaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestExpiredExtraDetailsOther;

//   /**
//   * Team merge request expired.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestExpiredShownToPrimaryTeamDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestExpiredShownToPrimaryTeamType {
//     description: string;
//   }

//   /**
//   * Team merge request expired.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestExpiredShownToSecondaryTeamDetails {
//     /**
//     * The email of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestExpiredShownToSecondaryTeamType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestExpiredType {
//     description: string;
//   }

//   /**
//   * Rejected a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestRejectedShownToPrimaryTeamDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestRejectedShownToPrimaryTeamType {
//     description: string;
//   }

//   /**
//   * Rejected a team merge request.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestRejectedShownToSecondaryTeamDetails {
//     /**
//     * The name of the secondary team admin who sent the request originally.
//     */
//     sent_by: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestRejectedShownToSecondaryTeamType {
//     description: string;
//   }

//   /**
//   * Sent a team merge request reminder.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestReminderDetails {
//     /**
//     * Team merge request reminder details.
//     */
//     request_reminder_details: DropboxTypes$team_log$TeamMergeRequestReminderExtraDetails;
//   }

//   /**
//   * Team merge request reminder details shown to the primary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestReminderExtraDetailsPrimaryTeam = {
//     ".tag": "primary_team",
//     ...
//   } & DropboxTypes$team_log$PrimaryTeamRequestReminderDetails;

//   /**
//   * Team merge request reminder details shown to the secondary team.
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestReminderExtraDetailsSecondaryTeam = {
//     ".tag": "secondary_team",
//     ...
//   } & DropboxTypes$team_log$SecondaryTeamRequestReminderDetails;

//   declare interface DropboxTypes$team_log$TeamMergeRequestReminderExtraDetailsOther {
//     ".tag": "other";
//   }

//   /**
//   * Team merge request reminder details
//   */
//   declare type DropboxTypes$team_log$TeamMergeRequestReminderExtraDetails =
//     | DropboxTypes$team_log$TeamMergeRequestReminderExtraDetailsPrimaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestReminderExtraDetailsSecondaryTeam
//     | DropboxTypes$team_log$TeamMergeRequestReminderExtraDetailsOther;

//   /**
//   * Sent a team merge request reminder.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestReminderShownToPrimaryTeamDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestReminderShownToPrimaryTeamType {
//     description: string;
//   }

//   /**
//   * Sent a team merge request reminder.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestReminderShownToSecondaryTeamDetails {
//     /**
//     * The email of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestReminderShownToSecondaryTeamType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestReminderType {
//     description: string;
//   }

//   /**
//   * Canceled the team merge.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestRevokedDetails {
//     /**
//     * The name of the other team.
//     */
//     team: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestRevokedType {
//     description: string;
//   }

//   /**
//   * Requested to merge their Dropbox team into yours.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestSentShownToPrimaryTeamDetails {
//     /**
//     * The secondary team name.
//     */
//     secondary_team: string;

//     /**
//     * The name of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestSentShownToPrimaryTeamType {
//     description: string;
//   }

//   /**
//   * Requested to merge your team into another Dropbox team.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeRequestSentShownToSecondaryTeamDetails {
//     /**
//     * The email of the primary team admin the request was sent to.
//     */
//     sent_to: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeRequestSentShownToSecondaryTeamType {
//     description: string;
//   }

//   /**
//   * Merged this team into another team.
//   */
//   declare interface DropboxTypes$team_log$TeamMergeToDetails {
//     /**
//     * The name of the team that this team was merged into.
//     */
//     team_name: string;
//   }

//   declare interface DropboxTypes$team_log$TeamMergeToType {
//     description: string;
//   }

//   /**
//   * Team name details
//   */
//   declare interface DropboxTypes$team_log$TeamName {
//     /**
//     * Team's display name.
//     */
//     team_display_name: string;

//     /**
//     * Team's legal name.
//     */
//     team_legal_name: string;
//   }

//   /**
//   * Added team logo to display on shared link headers.
//   */
//   declare interface DropboxTypes$team_log$TeamProfileAddLogoDetails {}

//   declare interface DropboxTypes$team_log$TeamProfileAddLogoType {
//     description: string;
//   }

//   /**
//   * Changed default language for team.
//   */
//   declare interface DropboxTypes$team_log$TeamProfileChangeDefaultLanguageDetails {
//     /**
//     * New team's default language.
//     */
//     new_value: DropboxTypes$common$LanguageCode;

//     /**
//     * Previous team's default language.
//     */
//     previous_value: DropboxTypes$common$LanguageCode;
//   }

//   declare interface DropboxTypes$team_log$TeamProfileChangeDefaultLanguageType {
//     description: string;
//   }

//   /**
//   * Changed team logo displayed on shared link headers.
//   */
//   declare interface DropboxTypes$team_log$TeamProfileChangeLogoDetails {}

//   declare interface DropboxTypes$team_log$TeamProfileChangeLogoType {
//     description: string;
//   }

//   /**
//   * Changed team name.
//   */
//   declare interface DropboxTypes$team_log$TeamProfileChangeNameDetails {
//     /**
//     * Previous teams name. Might be missing due to historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$TeamName;

//     /**
//     * New team name.
//     */
//     new_value: DropboxTypes$team_log$TeamName;
//   }

//   declare interface DropboxTypes$team_log$TeamProfileChangeNameType {
//     description: string;
//   }

//   /**
//   * Removed team logo displayed on shared link headers.
//   */
//   declare interface DropboxTypes$team_log$TeamProfileRemoveLogoDetails {}

//   declare interface DropboxTypes$team_log$TeamProfileRemoveLogoType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TeamSelectiveSyncPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$TeamSelectiveSyncPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$TeamSelectiveSyncPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for controlling whether team selective sync is enabled for team.
//   */
//   declare type DropboxTypes$team_log$TeamSelectiveSyncPolicy =
//     | DropboxTypes$team_log$TeamSelectiveSyncPolicyDisabled
//     | DropboxTypes$team_log$TeamSelectiveSyncPolicyEnabled
//     | DropboxTypes$team_log$TeamSelectiveSyncPolicyOther;

//   /**
//   * Enabled/disabled Team Selective Sync for team.
//   */
//   declare interface DropboxTypes$team_log$TeamSelectiveSyncPolicyChangedDetails {
//     /**
//     * New Team Selective Sync policy.
//     */
//     new_value: DropboxTypes$team_log$TeamSelectiveSyncPolicy;

//     /**
//     * Previous Team Selective Sync policy.
//     */
//     previous_value: DropboxTypes$team_log$TeamSelectiveSyncPolicy;
//   }

//   declare interface DropboxTypes$team_log$TeamSelectiveSyncPolicyChangedType {
//     description: string;
//   }

//   /**
//   * Changed sync default.
//   */
//   declare interface DropboxTypes$team_log$TeamSelectiveSyncSettingsChangedDetails {
//     /**
//     * Previous value.
//     */
//     previous_value: DropboxTypes$files$SyncSetting;

//     /**
//     * New value.
//     */
//     new_value: DropboxTypes$files$SyncSetting;
//   }

//   declare interface DropboxTypes$team_log$TeamSelectiveSyncSettingsChangedType {
//     description: string;
//   }

//   /**
//   * Added backup phone for two-step verification.
//   */
//   declare interface DropboxTypes$team_log$TfaAddBackupPhoneDetails {}

//   declare interface DropboxTypes$team_log$TfaAddBackupPhoneType {
//     description: string;
//   }

//   /**
//   * Added security key for two-step verification.
//   */
//   declare interface DropboxTypes$team_log$TfaAddSecurityKeyDetails {}

//   declare interface DropboxTypes$team_log$TfaAddSecurityKeyType {
//     description: string;
//   }

//   /**
//   * Changed backup phone for two-step verification.
//   */
//   declare interface DropboxTypes$team_log$TfaChangeBackupPhoneDetails {}

//   declare interface DropboxTypes$team_log$TfaChangeBackupPhoneType {
//     description: string;
//   }

//   /**
//   * Changed two-step verification setting for team.
//   */
//   declare interface DropboxTypes$team_log$TfaChangePolicyDetails {
//     /**
//     * New change policy.
//     */
//     new_value: DropboxTypes$team_policies$TwoStepVerificationPolicy;

//     /**
//     * Previous change policy. Might be missing due to historical data gap.
//     */
//     previous_value?: DropboxTypes$team_policies$TwoStepVerificationPolicy;
//   }

//   declare interface DropboxTypes$team_log$TfaChangePolicyType {
//     description: string;
//   }

//   /**
//   * Enabled/disabled/changed two-step verification setting.
//   */
//   declare interface DropboxTypes$team_log$TfaChangeStatusDetails {
//     /**
//     * The new two factor authentication configuration.
//     */
//     new_value: DropboxTypes$team_log$TfaConfiguration;

//     /**
//     * The previous two factor authentication configuration. Might be missing
//     * due to historical data gap.
//     */
//     previous_value?: DropboxTypes$team_log$TfaConfiguration;

//     /**
//     * Used two factor authentication rescue code. This flag is relevant when
//     * the two factor authentication configuration is disabled.
//     */
//     used_rescue_code?: boolean;
//   }

//   declare interface DropboxTypes$team_log$TfaChangeStatusType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TfaConfigurationDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$TfaConfigurationEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$TfaConfigurationSms {
//     ".tag": "sms";
//   }

//   declare interface DropboxTypes$team_log$TfaConfigurationAuthenticator {
//     ".tag": "authenticator";
//   }

//   declare interface DropboxTypes$team_log$TfaConfigurationOther {
//     ".tag": "other";
//   }

//   /**
//   * Two factor authentication configuration. Note: the enabled option is
//   * deprecated.
//   */
//   declare type DropboxTypes$team_log$TfaConfiguration =
//     | DropboxTypes$team_log$TfaConfigurationDisabled
//     | DropboxTypes$team_log$TfaConfigurationEnabled
//     | DropboxTypes$team_log$TfaConfigurationSms
//     | DropboxTypes$team_log$TfaConfigurationAuthenticator
//     | DropboxTypes$team_log$TfaConfigurationOther;

//   /**
//   * Removed backup phone for two-step verification.
//   */
//   declare interface DropboxTypes$team_log$TfaRemoveBackupPhoneDetails {}

//   declare interface DropboxTypes$team_log$TfaRemoveBackupPhoneType {
//     description: string;
//   }

//   /**
//   * Removed security key for two-step verification.
//   */
//   declare interface DropboxTypes$team_log$TfaRemoveSecurityKeyDetails {}

//   declare interface DropboxTypes$team_log$TfaRemoveSecurityKeyType {
//     description: string;
//   }

//   /**
//   * Reset two-step verification for team member.
//   */
//   declare interface DropboxTypes$team_log$TfaResetDetails {}

//   declare interface DropboxTypes$team_log$TfaResetType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TimeUnitMilliseconds {
//     ".tag": "milliseconds";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitSeconds {
//     ".tag": "seconds";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitMinutes {
//     ".tag": "minutes";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitHours {
//     ".tag": "hours";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitDays {
//     ".tag": "days";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitWeeks {
//     ".tag": "weeks";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitMonths {
//     ".tag": "months";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitYears {
//     ".tag": "years";
//   }

//   declare interface DropboxTypes$team_log$TimeUnitOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$TimeUnit =
//     | DropboxTypes$team_log$TimeUnitMilliseconds
//     | DropboxTypes$team_log$TimeUnitSeconds
//     | DropboxTypes$team_log$TimeUnitMinutes
//     | DropboxTypes$team_log$TimeUnitHours
//     | DropboxTypes$team_log$TimeUnitDays
//     | DropboxTypes$team_log$TimeUnitWeeks
//     | DropboxTypes$team_log$TimeUnitMonths
//     | DropboxTypes$team_log$TimeUnitYears
//     | DropboxTypes$team_log$TimeUnitOther;

//   /**
//   * User that is not a member of the team but considered trusted.
//   */
//   declare type DropboxTypes$team_log$TrustedNonTeamMemberLogInfo = {
//     /**
//     * Indicates the type of the trusted non team member user.
//     */
//     trusted_non_team_member_type: DropboxTypes$team_log$TrustedNonTeamMemberType,
//     ...
//   } & DropboxTypes$team_log$UserLogInfo;

//   /**
//   * Reference to the TrustedNonTeamMemberLogInfo type, identified by the
//   * value of the .tag property.
//   */
//   declare type DropboxTypes$team_log$TrustedNonTeamMemberLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "trusted_non_team_member",
//     ...
//   } & DropboxTypes$team_log$TrustedNonTeamMemberLogInfo;

//   declare interface DropboxTypes$team_log$TrustedNonTeamMemberTypeMultiInstanceAdmin {
//     ".tag": "multi_instance_admin";
//   }

//   declare interface DropboxTypes$team_log$TrustedNonTeamMemberTypeOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$TrustedNonTeamMemberType =
//     | DropboxTypes$team_log$TrustedNonTeamMemberTypeMultiInstanceAdmin
//     | DropboxTypes$team_log$TrustedNonTeamMemberTypeOther;

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestActionInvited {
//     ".tag": "invited";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestActionExpired {
//     ".tag": "expired";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestActionRevoked {
//     ".tag": "revoked";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestActionAccepted {
//     ".tag": "accepted";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestActionDeclined {
//     ".tag": "declined";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestActionOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$TrustedTeamsRequestAction =
//     | DropboxTypes$team_log$TrustedTeamsRequestActionInvited
//     | DropboxTypes$team_log$TrustedTeamsRequestActionExpired
//     | DropboxTypes$team_log$TrustedTeamsRequestActionRevoked
//     | DropboxTypes$team_log$TrustedTeamsRequestActionAccepted
//     | DropboxTypes$team_log$TrustedTeamsRequestActionDeclined
//     | DropboxTypes$team_log$TrustedTeamsRequestActionOther;

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestStateInvited {
//     ".tag": "invited";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestStateLinked {
//     ".tag": "linked";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestStateUnlinked {
//     ".tag": "unlinked";
//   }

//   declare interface DropboxTypes$team_log$TrustedTeamsRequestStateOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_log$TrustedTeamsRequestState =
//     | DropboxTypes$team_log$TrustedTeamsRequestStateInvited
//     | DropboxTypes$team_log$TrustedTeamsRequestStateLinked
//     | DropboxTypes$team_log$TrustedTeamsRequestStateUnlinked
//     | DropboxTypes$team_log$TrustedTeamsRequestStateOther;

//   /**
//   * Enabled/disabled option for members to link personal Dropbox account and
//   * team account to same computer.
//   */
//   declare interface DropboxTypes$team_log$TwoAccountChangePolicyDetails {
//     /**
//     * New two account policy.
//     */
//     new_value: DropboxTypes$team_log$TwoAccountPolicy;

//     /**
//     * Previous two account policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_log$TwoAccountPolicy;
//   }

//   declare interface DropboxTypes$team_log$TwoAccountChangePolicyType {
//     description: string;
//   }

//   declare interface DropboxTypes$team_log$TwoAccountPolicyDisabled {
//     ".tag": "disabled";
//   }

//   declare interface DropboxTypes$team_log$TwoAccountPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_log$TwoAccountPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy for pairing personal account to work account
//   */
//   declare type DropboxTypes$team_log$TwoAccountPolicy =
//     | DropboxTypes$team_log$TwoAccountPolicyDisabled
//     | DropboxTypes$team_log$TwoAccountPolicyEnabled
//     | DropboxTypes$team_log$TwoAccountPolicyOther;

//   /**
//   * User linked app
//   */
//   declare type DropboxTypes$team_log$UserLinkedAppLogInfo = {
//     ...
//   } & DropboxTypes$team_log$AppLogInfo;

//   /**
//   * Reference to the UserLinkedAppLogInfo type, identified by the value of
//   * the .tag property.
//   */
//   declare type DropboxTypes$team_log$UserLinkedAppLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "user_linked_app",
//     ...
//   } & DropboxTypes$team_log$UserLinkedAppLogInfo;

//   /**
//   * User's logged information.
//   */
//   declare interface DropboxTypes$team_log$UserLogInfo {
//     /**
//     * User unique ID. Might be missing due to historical data gap.
//     */
//     account_id?: DropboxTypes$users_common$AccountId;

//     /**
//     * User display name. Might be missing due to historical data gap.
//     */
//     display_name?: DropboxTypes$common$DisplayNameLegacy;

//     /**
//     * User email address. Might be missing due to historical data gap.
//     */
//     email?: DropboxTypes$team_log$EmailAddress;
//   }

//   /**
//   * Reference to the UserLogInfo polymorphic type. Contains a .tag property
//   * to let you discriminate between possible subtypes.
//   */
//   declare type DropboxTypes$team_log$UserLogInfoReference = {
//     /**
//     * Tag identifying the subtype variant.
//     */
//     ".tag": "team_member" | "trusted_non_team_member" | "non_team_member",
//     ...
//   } & DropboxTypes$team_log$UserLogInfo;

//   /**
//   * User's name logged information
//   */
//   declare interface DropboxTypes$team_log$UserNameLogInfo {
//     /**
//     * Given name.
//     */
//     given_name: string;

//     /**
//     * Surname.
//     */
//     surname: string;

//     /**
//     * Locale. Might be missing due to historical data gap.
//     */
//     locale?: string;
//   }

//   /**
//   * User or team linked app. Used when linked type is missing due to
//   * historical data gap.
//   */
//   declare type DropboxTypes$team_log$UserOrTeamLinkedAppLogInfo = {
//     ...
//   } & DropboxTypes$team_log$AppLogInfo;

//   /**
//   * Reference to the UserOrTeamLinkedAppLogInfo type, identified by the value
//   * of the .tag property.
//   */
//   declare type DropboxTypes$team_log$UserOrTeamLinkedAppLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "user_or_team_linked_app",
//     ...
//   } & DropboxTypes$team_log$UserOrTeamLinkedAppLogInfo;

//   /**
//   * Changed team policy for viewer info.
//   */
//   declare interface DropboxTypes$team_log$ViewerInfoPolicyChangedDetails {
//     /**
//     * Previous Viewer Info policy.
//     */
//     previous_value: DropboxTypes$team_log$PassPolicy;

//     /**
//     * New Viewer Info policy.
//     */
//     new_value: DropboxTypes$team_log$PassPolicy;
//   }

//   declare interface DropboxTypes$team_log$ViewerInfoPolicyChangedType {
//     description: string;
//   }

//   /**
//   * Information on active web sessions
//   */
//   declare type DropboxTypes$team_log$WebDeviceSessionLogInfo = {
//     /**
//     * Web session unique id. Might be missing due to historical data gap.
//     */
//     session_info?: DropboxTypes$team_log$WebSessionLogInfo,

//     /**
//     * Information on the hosting device.
//     */
//     user_agent: string,

//     /**
//     * Information on the hosting operating system.
//     */
//     os: string,

//     /**
//     * Information on the browser used for this web session.
//     */
//     browser: string,
//     ...
//   } & DropboxTypes$team_log$DeviceSessionLogInfo;

//   /**
//   * Reference to the WebDeviceSessionLogInfo type, identified by the value of
//   * the .tag property.
//   */
//   declare type DropboxTypes$team_log$WebDeviceSessionLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "web_device_session",
//     ...
//   } & DropboxTypes$team_log$WebDeviceSessionLogInfo;

//   /**
//   * Web session.
//   */
//   declare type DropboxTypes$team_log$WebSessionLogInfo = {
//     ...
//   } & DropboxTypes$team_log$SessionLogInfo;

//   /**
//   * Reference to the WebSessionLogInfo type, identified by the value of the
//   * .tag property.
//   */
//   declare type DropboxTypes$team_log$WebSessionLogInfoReference = {
//     /**
//     * Tag identifying this subtype variant. This field is only present when
//     * needed to discriminate between multiple possible subtypes.
//     */
//     ".tag": "web",
//     ...
//   } & DropboxTypes$team_log$WebSessionLogInfo;

//   /**
//   * Changed how long members can stay signed in to Dropbox.com.
//   */
//   declare interface DropboxTypes$team_log$WebSessionsChangeFixedLengthPolicyDetails {
//     /**
//     * New session length policy. Might be missing due to historical data gap.
//     */
//     new_value?: DropboxTypes$team_log$WebSessionsFixedLengthPolicy;

//     /**
//     * Previous session length policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_log$WebSessionsFixedLengthPolicy;
//   }

//   declare interface DropboxTypes$team_log$WebSessionsChangeFixedLengthPolicyType {
//     description: string;
//   }

//   /**
//   * Changed how long team members can be idle while signed in to Dropbox.com.
//   */
//   declare interface DropboxTypes$team_log$WebSessionsChangeIdleLengthPolicyDetails {
//     /**
//     * New idle length policy. Might be missing due to historical data gap.
//     */
//     new_value?: DropboxTypes$team_log$WebSessionsIdleLengthPolicy;

//     /**
//     * Previous idle length policy. Might be missing due to historical data
//     * gap.
//     */
//     previous_value?: DropboxTypes$team_log$WebSessionsIdleLengthPolicy;
//   }

//   declare interface DropboxTypes$team_log$WebSessionsChangeIdleLengthPolicyType {
//     description: string;
//   }

//   /**
//   * Defined fixed session length.
//   */
//   declare type DropboxTypes$team_log$WebSessionsFixedLengthPolicyDefined = {
//     ".tag": "defined",
//     ...
//   } & DropboxTypes$team_log$DurationLogInfo;

//   /**
//   * Undefined fixed session length.
//   */
//   declare interface DropboxTypes$team_log$WebSessionsFixedLengthPolicyUndefined {
//     ".tag": "undefined";
//   }

//   declare interface DropboxTypes$team_log$WebSessionsFixedLengthPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Web sessions fixed length policy.
//   */
//   declare type DropboxTypes$team_log$WebSessionsFixedLengthPolicy =
//     | DropboxTypes$team_log$WebSessionsFixedLengthPolicyDefined
//     | DropboxTypes$team_log$WebSessionsFixedLengthPolicyUndefined
//     | DropboxTypes$team_log$WebSessionsFixedLengthPolicyOther;

//   /**
//   * Defined idle session length.
//   */
//   declare type DropboxTypes$team_log$WebSessionsIdleLengthPolicyDefined = {
//     ".tag": "defined",
//     ...
//   } & DropboxTypes$team_log$DurationLogInfo;

//   /**
//   * Undefined idle session length.
//   */
//   declare interface DropboxTypes$team_log$WebSessionsIdleLengthPolicyUndefined {
//     ".tag": "undefined";
//   }

//   declare interface DropboxTypes$team_log$WebSessionsIdleLengthPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Web sessions idle length policy.
//   */
//   declare type DropboxTypes$team_log$WebSessionsIdleLengthPolicy =
//     | DropboxTypes$team_log$WebSessionsIdleLengthPolicyDefined
//     | DropboxTypes$team_log$WebSessionsIdleLengthPolicyUndefined
//     | DropboxTypes$team_log$WebSessionsIdleLengthPolicyOther;

//   declare type DropboxTypes$team_log$AppId = string;

//   declare type DropboxTypes$team_log$EmailAddress = string;

//   declare type DropboxTypes$team_log$FilePath = string;

//   declare type DropboxTypes$team_log$IpAddress = string;

//   declare type DropboxTypes$team_log$NamespaceId = string;

//   declare type DropboxTypes$team_log$RequestId = string;

//   declare type DropboxTypes$team_log$TeamEventList = Array<DropboxTypes$team_log$TeamEvent>;

//   /**
//   * Background camera uploads are disabled.
//   */
//   declare interface DropboxTypes$team_policies$CameraUploadsPolicyStateDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Background camera uploads are allowed.
//   */
//   declare interface DropboxTypes$team_policies$CameraUploadsPolicyStateEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_policies$CameraUploadsPolicyStateOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$CameraUploadsPolicyState =
//     | DropboxTypes$team_policies$CameraUploadsPolicyStateDisabled
//     | DropboxTypes$team_policies$CameraUploadsPolicyStateEnabled
//     | DropboxTypes$team_policies$CameraUploadsPolicyStateOther;

//   /**
//   * Emm token is disabled.
//   */
//   declare interface DropboxTypes$team_policies$EmmStateDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Emm token is optional.
//   */
//   declare interface DropboxTypes$team_policies$EmmStateOptional {
//     ".tag": "optional";
//   }

//   /**
//   * Emm token is required.
//   */
//   declare interface DropboxTypes$team_policies$EmmStateRequired {
//     ".tag": "required";
//   }

//   declare interface DropboxTypes$team_policies$EmmStateOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$EmmState =
//     | DropboxTypes$team_policies$EmmStateDisabled
//     | DropboxTypes$team_policies$EmmStateOptional
//     | DropboxTypes$team_policies$EmmStateRequired
//     | DropboxTypes$team_policies$EmmStateOther;

//   /**
//   * Team admins and members can create groups.
//   */
//   declare interface DropboxTypes$team_policies$GroupCreationAdminsAndMembers {
//     ".tag": "admins_and_members";
//   }

//   /**
//   * Only team admins can create groups.
//   */
//   declare interface DropboxTypes$team_policies$GroupCreationAdminsOnly {
//     ".tag": "admins_only";
//   }

//   declare type DropboxTypes$team_policies$GroupCreation =
//     | DropboxTypes$team_policies$GroupCreationAdminsAndMembers
//     | DropboxTypes$team_policies$GroupCreationAdminsOnly;

//   /**
//   * Office Add-In is disabled.
//   */
//   declare interface DropboxTypes$team_policies$OfficeAddInPolicyDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Office Add-In is enabled.
//   */
//   declare interface DropboxTypes$team_policies$OfficeAddInPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_policies$OfficeAddInPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$OfficeAddInPolicy =
//     | DropboxTypes$team_policies$OfficeAddInPolicyDisabled
//     | DropboxTypes$team_policies$OfficeAddInPolicyEnabled
//     | DropboxTypes$team_policies$OfficeAddInPolicyOther;

//   /**
//   * Everyone in team will be the default option when creating a folder in
//   * Paper.
//   */
//   declare interface DropboxTypes$team_policies$PaperDefaultFolderPolicyEveryoneInTeam {
//     ".tag": "everyone_in_team";
//   }

//   /**
//   * Invite only will be the default option when creating a folder in Paper.
//   */
//   declare interface DropboxTypes$team_policies$PaperDefaultFolderPolicyInviteOnly {
//     ".tag": "invite_only";
//   }

//   declare interface DropboxTypes$team_policies$PaperDefaultFolderPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$PaperDefaultFolderPolicy =
//     | DropboxTypes$team_policies$PaperDefaultFolderPolicyEveryoneInTeam
//     | DropboxTypes$team_policies$PaperDefaultFolderPolicyInviteOnly
//     | DropboxTypes$team_policies$PaperDefaultFolderPolicyOther;

//   /**
//   * All team members have access to Paper.
//   */
//   declare interface DropboxTypes$team_policies$PaperDeploymentPolicyFull {
//     ".tag": "full";
//   }

//   /**
//   * Only whitelisted team members can access Paper. To see which user is
//   * whitelisted, check 'is_paper_whitelisted' on 'account/info'.
//   */
//   declare interface DropboxTypes$team_policies$PaperDeploymentPolicyPartial {
//     ".tag": "partial";
//   }

//   declare interface DropboxTypes$team_policies$PaperDeploymentPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$PaperDeploymentPolicy =
//     | DropboxTypes$team_policies$PaperDeploymentPolicyFull
//     | DropboxTypes$team_policies$PaperDeploymentPolicyPartial
//     | DropboxTypes$team_policies$PaperDeploymentPolicyOther;

//   /**
//   * Do not allow team members to use Paper Desktop.
//   */
//   declare interface DropboxTypes$team_policies$PaperDesktopPolicyDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Allow team members to use Paper Desktop.
//   */
//   declare interface DropboxTypes$team_policies$PaperDesktopPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_policies$PaperDesktopPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$PaperDesktopPolicy =
//     | DropboxTypes$team_policies$PaperDesktopPolicyDisabled
//     | DropboxTypes$team_policies$PaperDesktopPolicyEnabled
//     | DropboxTypes$team_policies$PaperDesktopPolicyOther;

//   /**
//   * Paper is disabled.
//   */
//   declare interface DropboxTypes$team_policies$PaperEnabledPolicyDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Paper is enabled.
//   */
//   declare interface DropboxTypes$team_policies$PaperEnabledPolicyEnabled {
//     ".tag": "enabled";
//   }

//   /**
//   * Unspecified policy.
//   */
//   declare interface DropboxTypes$team_policies$PaperEnabledPolicyUnspecified {
//     ".tag": "unspecified";
//   }

//   declare interface DropboxTypes$team_policies$PaperEnabledPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$PaperEnabledPolicy =
//     | DropboxTypes$team_policies$PaperEnabledPolicyDisabled
//     | DropboxTypes$team_policies$PaperEnabledPolicyEnabled
//     | DropboxTypes$team_policies$PaperEnabledPolicyUnspecified
//     | DropboxTypes$team_policies$PaperEnabledPolicyOther;

//   /**
//   * User passwords will adhere to the minimal password strength policy.
//   */
//   declare interface DropboxTypes$team_policies$PasswordStrengthPolicyMinimalRequirements {
//     ".tag": "minimal_requirements";
//   }

//   /**
//   * User passwords will adhere to the moderate password strength policy.
//   */
//   declare interface DropboxTypes$team_policies$PasswordStrengthPolicyModeratePassword {
//     ".tag": "moderate_password";
//   }

//   /**
//   * User passwords will adhere to the very strong password strength policy.
//   */
//   declare interface DropboxTypes$team_policies$PasswordStrengthPolicyStrongPassword {
//     ".tag": "strong_password";
//   }

//   declare interface DropboxTypes$team_policies$PasswordStrengthPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$PasswordStrengthPolicy =
//     | DropboxTypes$team_policies$PasswordStrengthPolicyMinimalRequirements
//     | DropboxTypes$team_policies$PasswordStrengthPolicyModeratePassword
//     | DropboxTypes$team_policies$PasswordStrengthPolicyStrongPassword
//     | DropboxTypes$team_policies$PasswordStrengthPolicyOther;

//   /**
//   * Unlink all.
//   */
//   declare interface DropboxTypes$team_policies$RolloutMethodUnlinkAll {
//     ".tag": "unlink_all";
//   }

//   /**
//   * Unlink devices with the most inactivity.
//   */
//   declare interface DropboxTypes$team_policies$RolloutMethodUnlinkMostInactive {
//     ".tag": "unlink_most_inactive";
//   }

//   /**
//   * Add member to Exceptions.
//   */
//   declare interface DropboxTypes$team_policies$RolloutMethodAddMemberToExceptions {
//     ".tag": "add_member_to_exceptions";
//   }

//   declare type DropboxTypes$team_policies$RolloutMethod =
//     | DropboxTypes$team_policies$RolloutMethodUnlinkAll
//     | DropboxTypes$team_policies$RolloutMethodUnlinkMostInactive
//     | DropboxTypes$team_policies$RolloutMethodAddMemberToExceptions;

//   /**
//   * Team members can only join folders shared by teammates.
//   */
//   declare interface DropboxTypes$team_policies$SharedFolderJoinPolicyFromTeamOnly {
//     ".tag": "from_team_only";
//   }

//   /**
//   * Team members can join any shared folder, including those shared by users
//   * outside the team.
//   */
//   declare interface DropboxTypes$team_policies$SharedFolderJoinPolicyFromAnyone {
//     ".tag": "from_anyone";
//   }

//   declare interface DropboxTypes$team_policies$SharedFolderJoinPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy governing which shared folders a team member can join.
//   */
//   declare type DropboxTypes$team_policies$SharedFolderJoinPolicy =
//     | DropboxTypes$team_policies$SharedFolderJoinPolicyFromTeamOnly
//     | DropboxTypes$team_policies$SharedFolderJoinPolicyFromAnyone
//     | DropboxTypes$team_policies$SharedFolderJoinPolicyOther;

//   /**
//   * Only a teammate can be a member of a folder shared by a team member.
//   */
//   declare interface DropboxTypes$team_policies$SharedFolderMemberPolicyTeam {
//     ".tag": "team";
//   }

//   /**
//   * Anyone can be a member of a folder shared by a team member.
//   */
//   declare interface DropboxTypes$team_policies$SharedFolderMemberPolicyAnyone {
//     ".tag": "anyone";
//   }

//   declare interface DropboxTypes$team_policies$SharedFolderMemberPolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy governing who can be a member of a folder shared by a team member.
//   */
//   declare type DropboxTypes$team_policies$SharedFolderMemberPolicy =
//     | DropboxTypes$team_policies$SharedFolderMemberPolicyTeam
//     | DropboxTypes$team_policies$SharedFolderMemberPolicyAnyone
//     | DropboxTypes$team_policies$SharedFolderMemberPolicyOther;

//   /**
//   * By default, anyone can access newly created shared links. No login will
//   * be required to access the shared links unless overridden.
//   */
//   declare interface DropboxTypes$team_policies$SharedLinkCreatePolicyDefaultPublic {
//     ".tag": "default_public";
//   }

//   /**
//   * By default, only members of the same team can access newly created shared
//   * links. Login will be required to access the shared links unless
//   * overridden.
//   */
//   declare interface DropboxTypes$team_policies$SharedLinkCreatePolicyDefaultTeamOnly {
//     ".tag": "default_team_only";
//   }

//   /**
//   * Only members of the same team can access all shared links. Login will be
//   * required to access all shared links.
//   */
//   declare interface DropboxTypes$team_policies$SharedLinkCreatePolicyTeamOnly {
//     ".tag": "team_only";
//   }

//   declare interface DropboxTypes$team_policies$SharedLinkCreatePolicyOther {
//     ".tag": "other";
//   }

//   /**
//   * Policy governing the visibility of shared links. This policy can apply to
//   * newly created shared links, or all shared links.
//   */
//   declare type DropboxTypes$team_policies$SharedLinkCreatePolicy =
//     | DropboxTypes$team_policies$SharedLinkCreatePolicyDefaultPublic
//     | DropboxTypes$team_policies$SharedLinkCreatePolicyDefaultTeamOnly
//     | DropboxTypes$team_policies$SharedLinkCreatePolicyTeamOnly
//     | DropboxTypes$team_policies$SharedLinkCreatePolicyOther;

//   /**
//   * Do not allow files to be downloaded from Showcases.
//   */
//   declare interface DropboxTypes$team_policies$ShowcaseDownloadPolicyDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Allow files to be downloaded from Showcases.
//   */
//   declare interface DropboxTypes$team_policies$ShowcaseDownloadPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_policies$ShowcaseDownloadPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$ShowcaseDownloadPolicy =
//     | DropboxTypes$team_policies$ShowcaseDownloadPolicyDisabled
//     | DropboxTypes$team_policies$ShowcaseDownloadPolicyEnabled
//     | DropboxTypes$team_policies$ShowcaseDownloadPolicyOther;

//   /**
//   * Showcase is disabled.
//   */
//   declare interface DropboxTypes$team_policies$ShowcaseEnabledPolicyDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Showcase is enabled.
//   */
//   declare interface DropboxTypes$team_policies$ShowcaseEnabledPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_policies$ShowcaseEnabledPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$ShowcaseEnabledPolicy =
//     | DropboxTypes$team_policies$ShowcaseEnabledPolicyDisabled
//     | DropboxTypes$team_policies$ShowcaseEnabledPolicyEnabled
//     | DropboxTypes$team_policies$ShowcaseEnabledPolicyOther;

//   /**
//   * Do not allow showcases to be shared with people not on the team.
//   */
//   declare interface DropboxTypes$team_policies$ShowcaseExternalSharingPolicyDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Allow showcases to be shared with people not on the team.
//   */
//   declare interface DropboxTypes$team_policies$ShowcaseExternalSharingPolicyEnabled {
//     ".tag": "enabled";
//   }

//   declare interface DropboxTypes$team_policies$ShowcaseExternalSharingPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$ShowcaseExternalSharingPolicy =
//     | DropboxTypes$team_policies$ShowcaseExternalSharingPolicyDisabled
//     | DropboxTypes$team_policies$ShowcaseExternalSharingPolicyEnabled
//     | DropboxTypes$team_policies$ShowcaseExternalSharingPolicyOther;

//   /**
//   * The specified content will be synced as local files by default.
//   */
//   declare interface DropboxTypes$team_policies$SmartSyncPolicyLocal {
//     ".tag": "local";
//   }

//   /**
//   * The specified content will be synced as on-demand files by default.
//   */
//   declare interface DropboxTypes$team_policies$SmartSyncPolicyOnDemand {
//     ".tag": "on_demand";
//   }

//   declare interface DropboxTypes$team_policies$SmartSyncPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$SmartSyncPolicy =
//     | DropboxTypes$team_policies$SmartSyncPolicyLocal
//     | DropboxTypes$team_policies$SmartSyncPolicyOnDemand
//     | DropboxTypes$team_policies$SmartSyncPolicyOther;

//   /**
//   * Users will be able to sign in with their Dropbox credentials.
//   */
//   declare interface DropboxTypes$team_policies$SsoPolicyDisabled {
//     ".tag": "disabled";
//   }

//   /**
//   * Users will be able to sign in with either their Dropbox or single sign-on
//   * credentials.
//   */
//   declare interface DropboxTypes$team_policies$SsoPolicyOptional {
//     ".tag": "optional";
//   }

//   /**
//   * Users will be required to sign in with their single sign-on credentials.
//   */
//   declare interface DropboxTypes$team_policies$SsoPolicyRequired {
//     ".tag": "required";
//   }

//   declare interface DropboxTypes$team_policies$SsoPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$SsoPolicy =
//     | DropboxTypes$team_policies$SsoPolicyDisabled
//     | DropboxTypes$team_policies$SsoPolicyOptional
//     | DropboxTypes$team_policies$SsoPolicyRequired
//     | DropboxTypes$team_policies$SsoPolicyOther;

//   /**
//   * Policies governing team members.
//   */
//   declare interface DropboxTypes$team_policies$TeamMemberPolicies {
//     /**
//     * Policies governing sharing.
//     */
//     sharing: DropboxTypes$team_policies$TeamSharingPolicies;

//     /**
//     * This describes the Enterprise Mobility Management (EMM) state for this
//     * team. This information can be used to understand if an organization is
//     * integrating with a third-party EMM vendor to further manage and apply
//     * restrictions upon the team's Dropbox usage on mobile devices. This is a
//     * new feature and in the future we'll be adding more new fields and
//     * additional documentation.
//     */
//     emm_state: DropboxTypes$team_policies$EmmState;

//     /**
//     * The admin policy around the Dropbox Office Add-In for this team.
//     */
//     office_addin: DropboxTypes$team_policies$OfficeAddInPolicy;
//   }

//   /**
//   * Policies governing sharing within and outside of the team.
//   */
//   declare interface DropboxTypes$team_policies$TeamSharingPolicies {
//     /**
//     * Who can join folders shared by team members.
//     */
//     shared_folder_member_policy: DropboxTypes$team_policies$SharedFolderMemberPolicy;

//     /**
//     * Which shared folders team members can join.
//     */
//     shared_folder_join_policy: DropboxTypes$team_policies$SharedFolderJoinPolicy;

//     /**
//     * Who can view shared links owned by team members.
//     */
//     shared_link_create_policy: DropboxTypes$team_policies$SharedLinkCreatePolicy;
//   }

//   /**
//   * Enabled require two factor authorization.
//   */
//   declare interface DropboxTypes$team_policies$TwoStepVerificationPolicyRequireTfaEnable {
//     ".tag": "require_tfa_enable";
//   }

//   /**
//   * Disabled require two factor authorization.
//   */
//   declare interface DropboxTypes$team_policies$TwoStepVerificationPolicyRequireTfaDisable {
//     ".tag": "require_tfa_disable";
//   }

//   declare interface DropboxTypes$team_policies$TwoStepVerificationPolicyOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$TwoStepVerificationPolicy =
//     | DropboxTypes$team_policies$TwoStepVerificationPolicyRequireTfaEnable
//     | DropboxTypes$team_policies$TwoStepVerificationPolicyRequireTfaDisable
//     | DropboxTypes$team_policies$TwoStepVerificationPolicyOther;

//   /**
//   * Enabled require two factor authorization.
//   */
//   declare interface DropboxTypes$team_policies$TwoStepVerificationStateRequired {
//     ".tag": "required";
//   }

//   /**
//   * Optional require two factor authorization.
//   */
//   declare interface DropboxTypes$team_policies$TwoStepVerificationStateOptional {
//     ".tag": "optional";
//   }

//   declare interface DropboxTypes$team_policies$TwoStepVerificationStateOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$team_policies$TwoStepVerificationState =
//     | DropboxTypes$team_policies$TwoStepVerificationStateRequired
//     | DropboxTypes$team_policies$TwoStepVerificationStateOptional
//     | DropboxTypes$team_policies$TwoStepVerificationStateOther;

//   /**
//   * The amount of detail revealed about an account depends on the user being
//   * queried and the user making the query.
//   */
//   declare interface DropboxTypes$users$Account {
//     /**
//     * The user's unique Dropbox ID.
//     */
//     account_id: DropboxTypes$users_common$AccountId;

//     /**
//     * Details of a user's name.
//     */
//     name: DropboxTypes$users$Name;

//     /**
//     * The user's e-mail address. Do not rely on this without checking the
//     * email_verified field. Even then, it's possible that the user has since
//     * lost access to their e-mail.
//     */
//     email: string;

//     /**
//     * Whether the user has verified their e-mail address.
//     */
//     email_verified: boolean;

//     /**
//     * URL for the photo representing the user, if one is set.
//     */
//     profile_photo_url?: string;

//     /**
//     * Whether the user has been disabled.
//     */
//     disabled: boolean;
//   }

//   /**
//   * Basic information about any account.
//   */
//   declare type DropboxTypes$users$BasicAccount = {
//     /**
//     * Whether this user is a teammate of the current user. If this account is
//     * the current user's account, then this will be true.
//     */
//     is_teammate: boolean,

//     /**
//     * The user's unique team member id. This field will only be present if
//     * the user is part of a team and is_teammate is true.
//     */
//     team_member_id?: string,
//     ...
//   } & DropboxTypes$users$Account;

//   /**
//   * Detailed information about the current user's account.
//   */
//   declare type DropboxTypes$users$FullAccount = {
//     /**
//     * The user's two-letter country code, if available. Country codes are
//     * based on [ISO 3166-1]{@link http://en.wikipedia.org/wiki/ISO_3166-1}.
//     */
//     country?: string,

//     /**
//     * The language that the user specified. Locale tags will be [IETF
//     * language tags]{@link http://en.wikipedia.org/wiki/IETF_language_tag}.
//     */
//     locale: string,

//     /**
//     * The user's [referral link]{@link https://www.dropbox.com/referrals}.
//     */
//     referral_link: string,

//     /**
//     * If this account is a member of a team, information about that team.
//     */
//     team?: DropboxTypes$users$FullTeam,

//     /**
//     * This account's unique team member id. This field will only be present
//     * if team is present.
//     */
//     team_member_id?: string,

//     /**
//     * Whether the user has a personal and work account. If the current
//     * account is personal, then team will always be null, but is_paired will
//     * indicate if a work account is linked.
//     */
//     is_paired: boolean,

//     /**
//     * What type of account this user has.
//     */
//     account_type: DropboxTypes$users_common$AccountType,

//     /**
//     * The root info for this account.
//     */
//     root_info:
//       | DropboxTypes$common$TeamRootInfoReference
//       | DropboxTypes$common$UserRootInfoReference
//       | DropboxTypes$common$RootInfoReference,
//     ...
//   } & DropboxTypes$users$Account;

//   /**
//   * Detailed information about a team.
//   */
//   declare type DropboxTypes$users$FullTeam = {
//     /**
//     * Team policies governing sharing.
//     */
//     sharing_policies: DropboxTypes$team_policies$TeamSharingPolicies,

//     /**
//     * Team policy governing the use of the Office Add-In.
//     */
//     office_addin_policy: DropboxTypes$team_policies$OfficeAddInPolicy,
//     ...
//   } & DropboxTypes$users$Team;

//   declare interface DropboxTypes$users$GetAccountArg {
//     /**
//     * A user's account identifier.
//     */
//     account_id: DropboxTypes$users_common$AccountId;
//   }

//   declare interface DropboxTypes$users$GetAccountBatchArg {
//     /**
//     * List of user account identifiers.  Should not contain any duplicate
//     * account IDs.
//     */
//     account_ids: Array<DropboxTypes$users_common$AccountId>;
//   }

//   /**
//   * The value is an account ID specified in GetAccountBatchArg.account_ids
//   * that does not exist.
//   */
//   declare interface DropboxTypes$users$GetAccountBatchErrorNoAccount {
//     ".tag": "no_account";
//     no_account: DropboxTypes$users_common$AccountId;
//   }

//   declare interface DropboxTypes$users$GetAccountBatchErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$users$GetAccountBatchError =
//     | DropboxTypes$users$GetAccountBatchErrorNoAccount
//     | DropboxTypes$users$GetAccountBatchErrorOther;

//   /**
//   * The specified GetAccountArg.account_id does not exist.
//   */
//   declare interface DropboxTypes$users$GetAccountErrorNoAccount {
//     ".tag": "no_account";
//   }

//   declare interface DropboxTypes$users$GetAccountErrorOther {
//     ".tag": "other";
//   }

//   declare type DropboxTypes$users$GetAccountError =
//     | DropboxTypes$users$GetAccountErrorNoAccount
//     | DropboxTypes$users$GetAccountErrorOther;

//   declare interface DropboxTypes$users$IndividualSpaceAllocation {
//     /**
//     * The total space allocated to the user's account (bytes).
//     */
//     allocated: number;
//   }

//   /**
//   * Representations for a person's name to assist with internationalization.
//   */
//   declare interface DropboxTypes$users$Name {
//     /**
//     * Also known as a first name.
//     */
//     given_name: string;

//     /**
//     * Also known as a last name or family name.
//     */
//     surname: string;

//     /**
//     * Locale-dependent name. In the US, a person's familiar name is their
//     * given_name, but elsewhere, it could be any combination of a person's
//     * given_name and surname.
//     */
//     familiar_name: string;

//     /**
//     * A name that can be used directly to represent the name of a user's
//     * Dropbox account.
//     */
//     display_name: string;

//     /**
//     * An abbreviated form of the person's name. Their initials in most
//     * locales.
//     */
//     abbreviated_name: string;
//   }

//   /**
//   * The user's space allocation applies only to their individual account.
//   */
//   declare type DropboxTypes$users$SpaceAllocationIndividual = {
//     ".tag": "individual",
//     ...
//   } & DropboxTypes$users$IndividualSpaceAllocation;

//   /**
//   * The user shares space with other members of their team.
//   */
//   declare type DropboxTypes$users$SpaceAllocationTeam = {
//     ".tag": "team",
//     ...
//   } & DropboxTypes$users$TeamSpaceAllocation;

//   declare interface DropboxTypes$users$SpaceAllocationOther {
//     ".tag": "other";
//   }

//   /**
//   * Space is allocated differently based on the type of account.
//   */
//   declare type DropboxTypes$users$SpaceAllocation =
//     | DropboxTypes$users$SpaceAllocationIndividual
//     | DropboxTypes$users$SpaceAllocationTeam
//     | DropboxTypes$users$SpaceAllocationOther;

//   /**
//   * Information about a user's space usage and quota.
//   */
//   declare interface DropboxTypes$users$SpaceUsage {
//     /**
//     * The user's total space usage (bytes).
//     */
//     used: number;

//     /**
//     * The user's space allocation.
//     */
//     allocation: DropboxTypes$users$SpaceAllocation;
//   }

//   /**
//   * Information about a team.
//   */
//   declare interface DropboxTypes$users$Team {
//     /**
//     * The team's unique ID.
//     */
//     id: string;

//     /**
//     * The name of the team.
//     */
//     name: string;
//   }

//   declare interface DropboxTypes$users$TeamSpaceAllocation {
//     /**
//     * The total space currently used by the user's team (bytes).
//     */
//     used: number;

//     /**
//     * The total space allocated to the user's team (bytes).
//     */
//     allocated: number;

//     /**
//     * The total space allocated to the user within its team allocated space
//     * (0 means that no restriction is imposed on the user's quota within its
//     * team).
//     */
//     user_within_team_space_allocated: number;

//     /**
//     * The type of the space limit imposed on the team member (off,
//     * alert_only, stop_sync).
//     */
//     user_within_team_space_limit_type: DropboxTypes$team_common$MemberSpaceLimitType;
//   }

//   declare type DropboxTypes$users$GetAccountBatchResult = Array<DropboxTypes$users$BasicAccount>;

//   /**
//   * The basic account type.
//   */
//   declare interface DropboxTypes$users_common$AccountTypeBasic {
//     ".tag": "basic";
//   }

//   /**
//   * The Dropbox Pro account type.
//   */
//   declare interface DropboxTypes$users_common$AccountTypePro {
//     ".tag": "pro";
//   }

//   /**
//   * The Dropbox Business account type.
//   */
//   declare interface DropboxTypes$users_common$AccountTypeBusiness {
//     ".tag": "business";
//   }

//   /**
//   * What type of account this user has.
//   */
//   declare type DropboxTypes$users_common$AccountType =
//     | DropboxTypes$users_common$AccountTypeBasic
//     | DropboxTypes$users_common$AccountTypePro
//     | DropboxTypes$users_common$AccountTypeBusiness;

//   declare type DropboxTypes$users_common$AccountId = string;


//   declare class Dropbox {
//     constructor(options: DropboxOptions): void;

//     authTokenRevoke(arg: void): Promise<void>;

//     filesGetMetadata(arg: DropboxTypes$files$GetMetadataArg):
//       Promise<DropboxTypes$files$FileMetadataReference|DropboxTypes$files$FolderMetadataReference|DropboxTypes$files$DeletedMetadataReference>;

//     filesCreateFolderV2(arg: DropboxTypes$files$CreateFolderArg): Promise<DropboxTypes$files$CreateFolderResult>;

//     filesListFolder(arg: DropboxTypes$files$ListFolderArg): Promise<DropboxTypes$files$ListFolderResult>;

//     filesUpload(arg: DropboxTypes$files$CommitInfo): Promise<DropboxTypes$files$FileMetadata>;

//     filesDelete(arg: DropboxTypes$files$DeleteArg):
//       Promise<DropboxTypes$files$FileMetadataReference|DropboxTypes$files$FolderMetadataReference|DropboxTypes$files$DeletedMetadataReference>;

//     filesDownload(arg: DropboxTypes$files$DownloadArg): Promise<DropboxTypes$files$FileMetadata & {fileBlob?: Blob}>;
//   }
// }
