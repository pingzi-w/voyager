<template>
  <div class="header-balance">
    <div class="top">
      <div class="icon-container">
        <img class="icon" src="~assets/images/cosmos-logo.png">
      </div>
      <div class="total-atoms top-section">
        <h3>Total {{ bondDenom }}</h3>
        <h2 class="total-atoms__value">
          {{ num.shortNumber(totalAtoms) }}
        </h2>
      </div>
      <div v-if="unbondedAtoms" class="unbonded-atoms top-section">
        <h3>Available {{ bondDenom }}</h3>
        <h2>{{ unbondedAtoms }}</h2>
      </div>
    </div>
    <short-bech32 :address="session.address || ''" />
    <slot />
  </div>
</template>
<script>
import num from "scripts/num"
import ShortBech32 from "common/ShortBech32"
import { mapGetters } from "vuex"
export default {
  name: `tm-balance`,
  components: {
    ShortBech32
  },
  data() {
    return {
      num
    }
  },
  computed: {
    ...mapGetters([`session`, `liquidAtoms`, `totalAtoms`, `bondDenom`]),
    address() {
      return this.session.address
    },
    unbondedAtoms() {
      return this.num.shortNumber(this.liquidAtoms)
    }
  }
}
</script>
<style scoped>
.header-balance {
  align-items: baseline;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-top: 1rem;
  padding-left: 2rem;
}

.header-balance .top {
  display: flex;
  flex-direction: row;
}

.top-section {
  padding: 0 2rem;
}

.header-balance .top > .top-section {
  border-right: var(--bc-dim) 1px solid;
}

.header-balance .top > div:last-of-type {
  border-right: none;
}

.header-balance .top h3 {
  color: var(--dim);
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.header-balance .top h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 40px;
}

.header-balance .top .icon-container {
  display: block;
  height: 100%;
}

.header-balance .top .icon {
  border-right: none;
  height: 60px;
  margin: 0 1rem 0 0;
  padding: 0;
  width: 60px;
}

.header-balance .top .total-rewards .group {
  align-items: baseline;
  display: flex;
  flex-direction: row;
}

.header-balance .top .total-rewards .group a {
  padding-left: 10px;
}

.header-balance .short-bech32 {
  padding: 0.5rem 0 0.5rem 109px;
}

.tm-btn {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
}
</style>
