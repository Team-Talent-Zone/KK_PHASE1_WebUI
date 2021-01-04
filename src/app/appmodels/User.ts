import { FreelanceDocuments } from './FreelanceDocuments';
import { UserManagerDetails } from './UserManagerDetails';
import { UserBiz } from './UserBiz';
import { UserRole } from './UserRole';
import { Freelance } from './Freelance';
import { FreelanceHistory } from './FreelanceHistory';
export class User {
    constructor(
        public userId: number,
        public username: string,
        public password: string,
        public isactive: boolean,
        public firstname: string,
        public lastname: string,
        public fullname: string,
        public isrecoverypwd: boolean,
        public reasonofdeactivation: string,
        public createdon: string,
        public createdby: string,
        public updateby: string,
        public updatedon: string,
        public avtarurl: string,
        public preferlang: string,
        public phoneno: string,
        public uniqueidentificationcode: string,
        public userroles: UserRole,
        public userbizdetails: UserBiz,
        public freeLanceDetails: Freelance,
        public freelancehistoryentity: FreelanceHistory[] = [],
        public freelancedocumententity: FreelanceDocuments[] = [],
        public usermanagerdetailsentity: UserManagerDetails,
    ) {

    }
}
