import { Adapter } from './adapter';
import { User } from '../appmodels/User';

export class UserAdapter implements Adapter<User> {
    adapt(item: any): User {
        return new User(
            item.userId,
            item.username,
            item.password,
            item.isactive,
            item.firstname,
            item.lastname,
            item.fullname,
            item.isrecoverypwd,
            item.reasonofdeactivation,
            item.createdon,
            item.createdby,
            item.updateby,
            item.updatedon,
            item.avtarurl,
            item.preferlang,
            item.phoneno,
            item.uniqueidentificationcode,
            item.userroles,
            item.userbizdetails,
            item.freeLanceDetails,
            item.freelancehistoryentity,
            item.freelancedocumententity,
            item.usermanagerdetailsentity,
          );
    }
}
