// import crypto from 'crypto';
import crypto from 'crypto';

class ConsistentHash {
    private ring: string[] = [];
    private nodes: string[] = [];
    private replicas: number = 0;
    private virtualNodes = new Map();
    
    constructor(nodes: string[], replicas: number) {
        this.nodes = nodes;
        this.replicas = replicas;
        for (var i = 0; i < nodes.length; i++) {
            this.addNode(nodes[i], replicas);
        }
    }

    public addNode(node: string, replicas: number) {
        this.ring.push(this.getHash(node));
        for (var i = 0; i < replicas; i++) {
            const virKey = this.getHash(node + i);
            this.ring.push(virKey);
            this.virtualNodes.set(virKey, node);
        }
    }

    public removeNode(node: string) {
        var key = this.getHash(node);
        var index = this.ring.indexOf(key);
        if (index > -1) {
            this.ring.splice(index, 1); // delete this.ring[index]; // 注意，delete 只会清空元素，并不会缩减array长度 
            // 这里需要优化，可以提前保存node与virNode的关系
            for (var i = 0; i < this.replicas; i++) {
                const virKey = this.getHash(node + i);
                index = this.ring.indexOf(virKey);
                if (index > -1) {
                    this.ring.splice(index, 1);
                }
                this.virtualNodes.delete(virKey);
            }
        } else {
            console.error('Can not find the node');
        }
    }

    public getNode(name: string): string {
        const key = this.getHash(name);
        var index = this.ring.indexOf(key);
        if (index > -1) {
            return key;
        }
        // 这里有问题。。。
        return this.getHash(name);
    }

    public getRing() {
        return this.ring;
    }

    private getHash(value: string): string {
        return crypto.createHash('md5').update(value).digest('hex');;
    }
}

// const testCh = new ConsistentHash([], 5);
// const c6 = testCh.getNode('aac');
// const c1 = testCh.getNode('abc');
// const c2 = testCh.getNode('acc');
// const c3 = testCh.getNode('abc1');
// const c4 = testCh.getNode('1');
// const c5 = testCh.getNode('2');

// console.log(c1 > c2); // true
// console.log(c1 > c3); // true
// console.log(c1 > c6); // false
// console.log(c4 > c5); // fasle
// console.log('asdfasf' + 1);

const ring = new ConsistentHash(['abc', 'abb', 'abc1', '1', '2'], 3);
console.log(ring.getRing());
console.log(ring.getRing().length);
ring.removeNode('abc');
console.log(ring.getRing());
console.log(ring.getRing().length);