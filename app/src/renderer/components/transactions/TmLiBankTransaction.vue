<template>
  <tm-li-transaction
    :color="color"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="sent">
      <div slot="caption">
        Sent&nbsp;<b>{{ coins.amount }}</b><span>&nbsp;{{ coins.denom.toUpperCase() }}</span>
      </div>
      <span
        slot="details"
      >
        <template
          v-if="sentSelf"
        >
          To yourself!
        </template><template
          v-else
        >
          To {{ receiver }}
        </template>
      </span>
    </template><template v-else>
      <div slot="caption">
        Received&nbsp;<b>{{ coins.amount }}</b><span>&nbsp;{{ coins.denom.toUpperCase() }}</span>
      </div>
      <span slot="details">From {{ sender }}</span>
    </template>
  </tm-li-transaction>
</template>

<script>
import TmLiTransaction from "./TmLiTransaction"
import colors from "./transaction-colors.js"

export default {
  name: `tm-li-bank-transaction`,
  components: { TmLiTransaction },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    address: {
      type: String,
      default: null
    }
  },
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    // TODO: sum relevant inputs/outputs
    sentSelf() {
      return this.tx.from_address === this.tx.to_address
    },
    sent() {
      return this.tx.from_address === this.address
    },
    sender() {
      return this.tx.from_address
    },
    coins() {
      return this.tx.amount[0]
    },
    receiver() {
      return this.tx.to_address
    },
    color() {
      if (this.sent) return colors.bank.sent
      return colors.bank.received
    }
  }
}
</script>

<style>
.tm-li-tx {
  display: flex;
  font-size: var(--sm);
}

.tm-li-tx .tx-icon {
  padding: 0 0.5rem;
  background: var(--app-fg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-li-tx .tx-container {
  flex-direction: column;
  flex-wrap: nowrap;
  padding: 0.5rem 0;
  margin: 0.5rem 0;
  display: flex;
  width: 100%;
  min-width: 0;
}

.tm-li-tx .tx-element {
  padding: 0 2rem 0 1.5rem;
  line-height: 1.5rem;
}

.tm-li-tx .tx-coin .value {
  flex: 0 0 100%;
  font-size: var(--sm);
  color: var(--dim);
}

.tm-li-tx .tx-coin .value::before {
  content: "";
  display: inline;
}

.tm-li-tx .tx-coin .key {
  font-weight: 500;
  font-size: var(--m);
}

.tm-li-tx .tx-coin .value,
.tm-li-tx .tx-coin .key {
  line-height: 1.5rem;
}

.tm-li-tx .tx-address {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--dim);
  font-size: var(--sm);
}

.tm-li-tx.tm-li-tx-sent .tx-coin .value::before {
  content: "-";
}

.tm-li-tx.tm-li-tx-received .tx-icon {
  background: var(--app-fg);
}

.tm-li-tx.tm-li-tx-received .tx-coin .value {
  color: var(--success);
}

.tm-li-tx.tm-li-tx-received .tx-coin .value::before {
  content: "+";
}

.tm-li-tx:hover {
  cursor: pointer;
}

@media screen and (min-width: 700px) {
  .tm-li-tx {
    font-size: 0.875rem;
  }

  .tm-li-tx .tx-container {
    flex-direction: row;
  }

  .tm-li-tx .tx-container .tx-coins {
    flex: 0 0 9rem;
    padding: 0;
    min-width: 0;
  }

  .tm-li-tx .tx-container .tx-coins .tx-coin {
    padding: 0 1.5rem 0;
  }

  .tm-li-tx .tx-container .tx-coins .tx-coin .key {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
