export const levelOneAccess = ["viewer", "member", "developer", "admin", "owner"];
export const levelTwoAccess = ["member", "developer", "admin", "owner"];
export const levelThreeAccess = ["developer", "admin", "owner"];
export const levelFourAccess = ["admin", "owner"];
export const levelFiveAccess = ["owner"];

export type OrgRoleType = typeof levelOneAccess[number]; 

export const levelsToIndex = {
    "viewer": "0",
    "member": "1",
    "developer": "2",
    "admin": "3",
    "owner": "4",
}