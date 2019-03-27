import Mastodon from 'megalodon';
import { Instance } from '../types/Instance';

export function getCurrentInstanceData() {
    let instance;
    let client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') as string + "/api/v1/");
    instance = client.get<Instance>('/instance');
    return instance;
}