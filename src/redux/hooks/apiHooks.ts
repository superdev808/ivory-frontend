import { userApiSlice } from '../slices/api/userApiSlice'

// RTK Query Hooks


export const {

    usePostCheckEmailMutation,
    usePostRegisterUserMutation,
    useGetVerifyUserQuery,
    usePostRequestPasswordResetMutation,
    usePostValidateTokenMutation,
    usePostResetPasswordMutation,
    useGetUserInfoQuery,
    usePutUpdateUserInfoMutation,
    usePostSendResetPasswordMutation
} = userApiSlice
