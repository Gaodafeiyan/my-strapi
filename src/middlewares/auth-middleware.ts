/**
 * 自定义认证中间件
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // 检查请求头中的Authorization token
      const token = ctx.request.header.authorization;
      
      if (!token) {
        return ctx.unauthorized('未提供认证token');
      }

      // 验证token（这里可以添加你的token验证逻辑）
      // 暂时允许所有请求通过，后续可以添加具体的验证逻辑
      
      await next();
    } catch (error) {
      return ctx.unauthorized('认证失败');
    }
  };
}; 