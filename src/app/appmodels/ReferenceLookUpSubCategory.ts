export class ReferenceLookUpSubCategory {
Id: number;
code: string;
key: string;
label: string;
shortkey: string;
orderid: number;

constructor(response: any) {
    this.Id = response.Id;
    this.code = response.code;
    this.key = response.key;
    this.label = response.label;
    this.shortkey = response.shortkey;
    this.orderid = response.orderid;
}
}
 