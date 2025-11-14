import {
    getConfig,
    getZhcsData,
    getXzqhByXzqhbm,
    getOrgList,
    getDeptsByMySelfOrgId,
    getOrg,
} from "@/api/common";

export const useCommonStore = defineStore("common", () => {
    const dictionaryNameList = ["ZHCS", "ZQZT", "CLZT"];
    const config = ref<any>(null);
    const orgTreeData = ref<any>({});
    const orgData = ref<any>({});
    const orgDataById = ref<any>({});
    const dictionary = ref<any>(null);
    // const xzqhList = ref<any[]>([]);
    const xzqhTopObj = ref<any>({});
    // const currentUser = ref<any>({ ...JSON.parse(sessionStorage.getItem("currentUser") || "{}") });
    const currentUser = ref<any>({ user: { gsdwid: "" } }); // TODO ?

    const getConfigData = async () => {
        const res: any = await getConfig({
            application:
                "twms-brace-client-activemq,twms-common-config,twms-web-offsiteoversee",
            profile: "dev",
            label: "master",
        });
        config.value = res.data;
        currentUser.value.user.gsdwid = config.value["current.organid.zhidui"];
        const sessionUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
        sessionUser && sessionUser.user && sessionUser.user.gsdwid && Object.assign(currentUser.value, sessionUser);
        getXzqhListData();
    };
    const getXzqhListData = async () => {
        const res: any = await getXzqhByXzqhbm(config.value["current.xzqhdm"]);
        xzqhTopObj.value = res.data;
    };
    const getDictionaryData = async () => {
        const dicList: any = await getZhcsData(dictionaryNameList);
        dictionary.value = {};
        dicList.data.forEach((item: any) => {
            dictionary.value[item.bzbh] = item.details;
        });
    };
    const getOrgListData = async () => {
        // const res: any = await getOrgList(currentUser.value?.user?.gsdwid);
        const res: any = await getDeptsByMySelfOrgId(currentUser.value?.user?.gsdwid);
        orgTreeData.value = res.data;
    };
    
    const getOrgData = async () => {
        const res: any = await getOrg(currentUser.value?.user?.gsdwid);
        orgData.value = res.data;
    };
    const getOrgDataById = async (xfjgid: any) => {
        const res: any = await getOrg(xfjgid);
        orgDataById.value = res.data;
    };
    return {
        xzqhTopObj,
        // xzqhList,
        currentUser,
        config,
        getConfigData,
        dictionary,
        getDictionaryData,
        orgTreeData,
        getOrgListData,
        orgData,
        getOrgData,
        getOrgDataById,
        orgDataById,
    };
});
