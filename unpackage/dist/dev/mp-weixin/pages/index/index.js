"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      selected: [],
      // 多选保存数组
      loading: false,
      projects: [
        { id: "1", name: "地铁18号线延伸工程" },
        { id: "2", name: "地铁18号线延伸工程" },
        { id: "3", name: "地铁18号线延伸工程" },
        { id: "4", name: "地铁18号线延伸工程" },
        { id: "5", name: "地铁18号线延伸工程" },
        { id: "6", name: "地铁18号线延伸工程" },
        { id: "7", name: "地铁18号线延伸工程" },
        { id: "8", name: "地铁18号线延伸工程" },
        { id: "9", name: "地铁18号线延伸工程" },
        { id: "10", name: "地铁18号线延伸工程" },
        { id: "11", name: "地铁18号线延伸工程" },
        { id: "12", name: "地铁18号线延伸工程" },
        { id: "13", name: "地铁18号线延伸工程" },
        { id: "14", name: "地铁18号线延伸工程" }
      ]
    };
  },
  methods: {
    toggleSelect(id) {
      const index = this.selected.indexOf(id);
      if (index > -1) {
        this.selected.splice(index, 1);
      } else {
        this.selected.push(id);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.projects, (project, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(project.name),
        b: $data.selected.includes(project.id)
      }, $data.selected.includes(project.id) ? {} : {}, {
        c: $data.selected.includes(project.id) ? 1 : "",
        d: index,
        e: common_vendor.o(($event) => $options.toggleSelect(project.id), index)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
